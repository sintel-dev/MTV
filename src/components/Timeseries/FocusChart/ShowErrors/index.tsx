import React, { Component } from 'react';
import * as d3 from 'd3';
// import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  getAggregationZoomValue,
  getEventInterval,
  getIsSigRawLoading,
  getSignalRawData,
} from 'src/model/selectors/aggregationLevels';
import {
  getSelectedPeriodRange,
  getDatarunDetails,
  isPredictionEnabled,
  getIsAggregationActive,
  getAggregationWrapperCoords,
} from 'src/model/selectors/datarun';
import { RootState } from 'src/model/types';
import { setTimeseriesPeriod } from 'src/model/actions/datarun';
import { getWrapperSize } from '../FocusChartUtils';
import { FocusChartConstants } from '../Constants';
import './ShowErrors.scss';

const { ANOMALIES_HEIGHT, TRANSLATE_LEFT, CHART_MARGIN, MIN_VALUE, MAX_VALUE } = FocusChartConstants;

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;
type Props = StateProps & DispatchProps;
type LocalState = {
  width: number;
  height: number;
};

class ShowErrors extends Component<Props, LocalState> {
  constructor(props: Props) {
    super(props);
    this.state = {
      width: 0,
      height: ANOMALIES_HEIGHT,
    };
  }

  // postponed
  componentDidMount() {
    const { width } = getWrapperSize();
    this.setState({ width });
  }

  // postponed
  // componentDidUpdate(prevProps){
  //   if(prevProps.periodRange.zoomValue !== this.props.periodRange.zoomValue){
  //     this.updateZoom();
  //   }
  // }

  private getScale() {
    const { dataRun } = this.props;
    const { maxTimeSeries } = dataRun;
    const { width, height } = this.state;

    const [minTX, maxTX] = d3.extent(maxTimeSeries, (time: Array<number>) => time[0]) as [number, number];

    const [minTY, maxTY] = d3.extent(maxTimeSeries, (time: Array<number>) => time[1]) as [number, number];
    const drawableWidth: number = width - 2 * CHART_MARGIN - TRANSLATE_LEFT;
    const drawableHeight: number = height - 3.5 * CHART_MARGIN;

    const xCoord = d3.scaleTime().range([0, drawableWidth]);
    const yCoord = d3.scaleLinear().range([drawableHeight, 0]);

    const minX: number = Math.min(MIN_VALUE, minTX);
    const maxX: number = Math.max(MAX_VALUE, maxTX);

    const minY: number = Math.min(MIN_VALUE, minTY);
    const maxY: number = Math.max(MAX_VALUE, maxTY);

    xCoord.domain([minX, maxX]);
    yCoord.domain([minY, maxY]);
    return { xCoord, yCoord };
  }

  private getArea() {
    const { height } = this.state;
    const { dataRun, periodRange } = this.props;
    const { zoomValue } = periodRange;
    const { timeseriesErr } = dataRun;
    const { xCoord } = this.getScale();

    const yRange = d3.scaleLinear().range([0, height - 10]);
    yRange.domain(d3.extent(timeseriesErr, (tmsData) => tmsData[1]));
    const xCoordCopy = xCoord.copy();

    if (zoomValue !== 1) {
      xCoord.domain((zoomValue as any).rescaleX(xCoordCopy).domain());
    }

    const area = d3
      .area()
      .x((d) => xCoord(d[0]))
      .y0((d) => -yRange(d[1]) / 2)
      .y1((d) => yRange(d[1]) / 2);
    return area(timeseriesErr);
  }

  // postponed
  // initZoom(){
  //   const { height, zoomWidth } = this.state;
  //   const zoom = d3
  //     .zoom()
  //     .scaleExtent([1, Infinity])
  //     .translateExtent([
  //       [0, 0],
  //       [zoomWidth, height],
  //     ])
  //     .extent([
  //       [0, 0],
  //       [zoomWidth, height],
  //     ])
  //     .on('zoom', () => this.zoomHandler());

  //   d3.select('.anomalies-zoom').call(zoom);
  // }

  // postponed
  // zoomHandler(){

  //   if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'brush') {
  //     return;
  //   }
  //   const {xCoord} = this.getScale();

  //   const xCoordCopy = xCoord.copy()

  //   let zoomValue = d3.event.transform;

  //   if (zoomValue === 1) {
  //     return;
  //   }
  //   const timeStamp = zoomValue.rescaleX(xCoordCopy).domain();

  //   const eventRange: Array<number> = xCoord.range().map(zoomValue.invertX, zoomValue);
  //   const timeStamStart: number = new Date(timeStamp[0]).getTime();
  //   const timeStampStop: number = new Date(timeStamp[1]).getTime();

  //   const periodRange = {
  //     eventRange,
  //     zoomValue,
  //     timeStamp: [timeStamStart, timeStampStop]
  //   }
  //   this.props.setPeriodRange(periodRange);
  // }

  // postponed
  // private updateZoom() {
  //   const { height } = this.state;
  //   const { dataRun, periodRange, isPredictionVisible } = this.props;
  //   const { zoomValue } = periodRange;

  //   const { timeseriesErr } = dataRun;
  //   const { xCoord } = this.getScale();
  //   const xCoordCopy = xCoord.copy();
  //   const yRange = d3.scaleLinear().range([0, height - 10]);

  //   const area = d3
  //     .area()
  //     .x((data) => xCoord(data[0]))
  //     .y0((data) => -yRange(data[1]) / 2)
  //     .y1((data) => yRange(data[1]) / 2);

  //   // @TODO - zoom is being desincronized when aggregation level is active

  //     xCoord.domain(zoomValue.rescaleX(xCoordCopy).domain());
  //     yRange.domain(d3.extent(timeseriesErr, (tmsData) => tmsData[1]));
  //     d3.select('.err-data').datum(timeseriesErr).attr('d', area);

  // }

  renderEventWrapper() {
    const { dataRun, aggergationCoords, isAggregationActive, periodRange } = this.props;

    if (!isAggregationActive || !aggergationCoords) {
      return null;
    }
    const { zoomValue } = periodRange;
    const { xCoord } = this.getScale();
    const xCoordCopy = xCoord.copy();

    if (zoomValue !== 1) {
      xCoord.domain((zoomValue as any).rescaleX(xCoordCopy).domain());
    }

    const { timeseriesErr } = dataRun;
    const { eventData } = aggergationCoords;

    const evtHighlight = Math.max(xCoord(timeseriesErr[eventData[1]][0]) - xCoord(timeseriesErr[eventData[0]][0]));
    const translateHiglight: number = xCoord(timeseriesErr[eventData[0]][0]) + TRANSLATE_LEFT;

    return (
      <rect
        className="event-highlight"
        width={evtHighlight}
        height={84}
        transform={`translate(${translateHiglight}, 3)`}
        rx="2"
      />
    );
  }

  public render() {
    const { width, height } = this.state;
    const { isPredictionVisible } = this.props;
    return isPredictionVisible ? (
      <div className="show-errors">
        <svg id="showErrors" width={width} height={height}>
          <rect className="err-bg" width={width} />
          <clipPath id="prectionClip">
            <rect width={width} height={height} />
          </clipPath>
          <g clipPath="url(#prectionClip)">
            {this.renderEventWrapper()}
            <path
              d={this.getArea()}
              className="err-data"
              style={{ transform: `translate(${TRANSLATE_LEFT}px, ${ANOMALIES_HEIGHT / 2}px)` }}
            />
          </g>
          <rect className="anomalies-zoom" width={width} height={height} />
        </svg>
      </div>
    ) : null;
  }
}

const mapState = (state: RootState) => ({
  periodRange: getSelectedPeriodRange(state),
  dataRun: getDatarunDetails(state),
  isAggregationActive: getIsAggregationActive(state),
  eventInterval: getEventInterval(state),
  isPredictionVisible: isPredictionEnabled(state),
  isSignalRawLoading: getIsSigRawLoading(state),
  signalRawData: getSignalRawData(state),
  aggZoomValue: getAggregationZoomValue(state),
  aggergationCoords: getAggregationWrapperCoords(state),
});

const mapDispatch = (dispatch: Function) => ({
  setPeriodRange: (periodRange) => dispatch(setTimeseriesPeriod(periodRange)),
});

export default connect<StateProps, DispatchProps, {}, RootState>(mapState, mapDispatch)(ShowErrors);
