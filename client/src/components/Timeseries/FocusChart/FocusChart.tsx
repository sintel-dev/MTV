import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as d3 from 'd3';
import { RootState } from '../../../model/types';
import { FocusChartConstants, colorSchemes } from './Constants';
import EventDetails from './EventDetails';
import AddEvent from './FocusChartEvents/AddEvent';
import ShowErrors from './ShowErrors';
import { setTimeseriesPeriod, setActiveEventAction } from '../../../model/actions/datarun';
import { formatDate } from '../../../model/utils/Utils';
import { getWrapperSize, getSelectedRange } from './FocusChartUtils';
import ZoomControls from './ZoomControls';
import {
  getDatarunDetails,
  isPredictionEnabled,
  getSelectedPeriodRange,
  getIsAddingNewEvents,
  getSelectedPeriodLevel,
  getReviewPeriod,
  getZoomCounter,
  getZoomOnClickDirection,
  getIsEditingEventRange,
  getSimilarEvents,
  isSimilarEventsLoading,
  getLastSearchedDatarunID
} from '../../../model/selectors/datarun';
import './FocusChart.scss';

const { TRANSLATE_LEFT, CHART_MARGIN, MIN_VALUE, MAX_VALUE } = FocusChartConstants;

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;
type Props = StateProps & DispatchProps;

type State = {
  width?: number;
  height?: number;
  eventData?: any;
  chart?: any;
  zoomValue?: object | number;
  brushInstance?: any;
  brushContext?: any;
  isTooltipVisible?: boolean;
  tooltipData?: any;
  zoom?: object;
};

class FocusChart extends Component<Props, State> {
  private zoom: any;

  constructor(props) {
    super(props);
    this.state = {
      width: 0,
      height: 0,
      isTooltipVisible: false,
      eventData: {},
    };
  }

  componentDidMount() {
    const { width, height } = getWrapperSize();
    this.setState(
      {
        width,
        height,
      },
      () => {
        this.initZoom();
      },
    );
  }

  componentDidUpdate(prevProps: Props) {
    this.renderChartAxis();

    if (prevProps.periodRange.zoomValue !== this.props.periodRange.zoomValue) {
      this.updateZoom();
    }

    if (prevProps.selectedPeriod !== this.props.selectedPeriod || prevProps.reviewRange !== this.props.reviewRange) {
      this.updateChartZoomOnSelectPeriod();
    }
    if (prevProps.zoomCounter !== this.props.zoomCounter) {
      this.updateZoomOnClick();
    }

    if (prevProps.isEditingRange !== this.props.isEditingRange) {
      this.toggleZoom();
    }
  }

  renderSimilarEvents(currentEvent) {
    if (this.props.lastSearchedDatarunID !== this.props.dataRun.id) { return; }
    const { dataRun, periodRange } = this.props;
    const { height } = this.state;

    const { xCoord } = this.getScale();
    const xCoordCopy = xCoord.copy();
    const commentHeight = height - 3.5 * CHART_MARGIN;

    // if there's a zoom level
    // @ts-ignore
    if (periodRange.zoomValue !== 1) {
      // @ts-ignore
      xCoord.domain(periodRange.zoomValue.rescaleX(xCoordCopy).domain());
    }

    const commentWidth = Math.max(xCoord(currentEvent.end*1000) - xCoord(currentEvent.start*1000));
    const translateComment = xCoord(currentEvent.start*1000);

    return (
      <g key={`sim${currentEvent.start}`}>
        <rect className="event-similar" width={commentWidth} height={commentHeight} y={0} x={translateComment} fill={"#ca7f76"} />
      </g>
    );
  }

  getScale() {
    const { width, height } = this.state;
    const { dataRun } = this.props;
    const { maxTimeSeries, timeSeries } = dataRun;
    const [minTX, maxTX] = d3.extent(maxTimeSeries, (time: Array<number>) => time[0]);
    const [minTY, maxTY] = d3.extent(timeSeries, (time: Array<number>) => time[1]);
    const drawableWidth = width - 2 * CHART_MARGIN - TRANSLATE_LEFT;
    const drawableHeight = height - 3.5 * CHART_MARGIN;

    const xCoord = d3.scaleTime().range([0, drawableWidth]);
    const yCoord = d3.scaleLinear().range([drawableHeight, 0]);

    const minX = Math.min(MIN_VALUE, minTX);
    const maxX = Math.max(MAX_VALUE, maxTX);

    const minY = Math.min(MIN_VALUE, minTY);
    const maxY = Math.max(MAX_VALUE, maxTY);

    xCoord.domain([minX, maxX]);
    yCoord.domain([minY, maxY]);

    return { xCoord, yCoord };
  }

  drawLine(data) {
    const { periodRange } = this.props;
    const { zoomValue } = periodRange;
    const { xCoord, yCoord } = this.getScale();
    const xCoordCopy = xCoord.copy();
    // @ts-ignore
    if (zoomValue !== 1) {
      // @ts-ignore
      xCoord.domain(zoomValue.rescaleX(xCoordCopy).domain());
    }

    const line = d3
      .line()
      .x((d) => xCoord(d[0]))
      .y((d) => yCoord(d[1]));
    return line(data);
  }

  drawPredLine(data) {
    const { periodRange } = this.props;
    const { zoomValue } = periodRange;
    const { xCoord, yCoord } = this.getScale();
    const xCoordCopy = xCoord.copy();
    // @ts-ignore
    if (zoomValue !== 1) {
      // @ts-ignore
      xCoord.domain(zoomValue.rescaleX(xCoordCopy).domain());
    }

    const line = d3
      .line()
      .x((d) => xCoord(d[0]))
      .y((d) => {
        return Array.isArray(d[1]) ? yCoord(d[1][2]) : yCoord(d[1]);
      });
    return line(data);
  }

  renderEventTooltip() {
    const { eventData } = this.state;
    const startDate = formatDate(eventData.startDate);
    const endDate = formatDate(eventData.stopDate);
    const tooltipOffset = 20;

    return (
      <div
        className="tooltip-data"
        style={{ left: `${eventData.xCoord + tooltipOffset}px`, top: `${eventData.yCoord}px` }}
      >
        <ul>
          <li>
            starts:
            <span>
              {startDate.day}/{startDate.month}/{startDate.year}
            </span>
            <span>{startDate.time}</span>
          </li>
          <li>
            ends:
            <span>
              {endDate.day}/{endDate.month}/{endDate.year}
            </span>
            <span>{endDate.time}</span>
          </li>
        </ul>
      </div>
    );
  }

  renderEvents(currentEvent) {

    const { dataRun, periodRange, setActiveEvent } = this.props;
    const { timeSeries } = dataRun;
    const { height } = this.state;

    const { xCoord } = this.getScale();
    const xCoordCopy = xCoord.copy();
    const commentHeight = height - 3.5 * CHART_MARGIN;

    let startIndex = currentEvent[0];
    let stopIndex = currentEvent[1];

    const event = timeSeries.slice(startIndex, stopIndex + 1);

    // if there's a zoom level
    // @ts-ignore
    if (periodRange.zoomValue !== 1) {
      // @ts-ignore
      xCoord.domain(periodRange.zoomValue.rescaleX(xCoordCopy).domain());
    }

    const commentWidth = Math.max(xCoord(timeSeries[stopIndex][0]) - xCoord(timeSeries[startIndex][0]));
    const translateComment = xCoord(timeSeries[startIndex][0]);
    const tagColor = colorSchemes[currentEvent[4]] || colorSchemes.Untagged;

    const startDate = new Date(timeSeries[startIndex][0]);
    const stopDate = new Date(timeSeries[stopIndex][0]);

    let displayArea = this.props.lastSearchedDatarunID !== this.props.dataRun.id ? true : false;

    return (
      <g
        className="line-highlight"
        key={currentEvent[3]}
        id={`_${currentEvent[3]}`}
        onClick={() => setActiveEvent(currentEvent[3])}
        onMouseMove={(evt) => {
          evt.stopPropagation();
          evt.preventDefault();
          this.setState({
            isTooltipVisible: true,
            eventData: {
              xCoord: evt.clientX,
              yCoord: evt.clientY,
              startDate,
              stopDate,
            },
          });
          
        }}
        onMouseLeave={(evt) => {
          evt.stopPropagation();
          evt.preventDefault();
          this.setState({ isTooltipVisible: false });
        }}
      >
        <path className="evt-highlight" d={this.drawLine(event)} />
        {displayArea && 
        <g className="event-comment">
          <rect className="evt-area" width={commentWidth} height={commentHeight} y={0} x={translateComment} />
          <rect className="evt-comment" height="10" width={commentWidth} y="0" x={translateComment} fill={tagColor} />
        </g>}
      </g>
    );
  }

  renderChartAxis() {
    const { periodRange } = this.props;
    const { xCoord, yCoord } = this.getScale();
    const xCoordCopy = xCoord.copy();

    // if there's a zoom level
    // @ts-ignore
    if (periodRange.zoomValue !== 1) {
      // @ts-ignore
      xCoord.domain(periodRange.zoomValue.rescaleX(xCoordCopy).domain());
    }
    const xAxis = d3.axisBottom(xCoord);
    const yAxis = d3.axisLeft(yCoord);

    d3.select('.axis.axis--x').call(xAxis);
    d3.select('.axis.axis--y').call(yAxis).call(yAxis.ticks(5, d3.format("~s")));
  }

  initZoom() {
    const { width, height } = this.state;
    const zoomWidth = width - TRANSLATE_LEFT - 2 * CHART_MARGIN;
    const zoom = d3
      .zoom()
      .scaleExtent([1, Infinity])
      .translateExtent([
        [0, 0],
        [zoomWidth, height],
      ])
      .extent([
        [0, 0],
        [zoomWidth, height],
      ])
      .on('zoom', () => this.zoomHandler());

    d3.select('.zoom').call(zoom);

    this.zoom = zoom;
  }

  updateZoom() {
    const { periodRange } = this.props;
    d3.select('.zoom').call(this.zoom.transform, periodRange.zoomValue);
  }

  zoomHandler() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'brush') {
      return;
    }

    const { xCoord } = this.getScale();
    let zoomValue = d3.event.transform;

    if (zoomValue === 1) {
      return;
    }

    const eventRange = xCoord.range().map(zoomValue.invertX, zoomValue);
    const periodRange = {
      eventRange: [eventRange[0] < 0 ? 0 : eventRange[0], eventRange[1]],
      zoomValue,
    };

    this.props.setPeriodRange(periodRange);
    // d3.event.stopPropagation();
  }

  toggleZoom() {
    const { isEditingRange } = this.props;
    const zoomWidth = this.state.width - TRANSLATE_LEFT - 2 * CHART_MARGIN;
    if (isEditingRange) {
      d3.select('.zoom').attr('width', 0);
    } else {
      d3.select('.zoom').attr('width', zoomWidth);
    }
  }

  updateChartZoomOnSelectPeriod() {
    const { width } = this.state;
    const focusChartWidth = width - TRANSLATE_LEFT - 2 * CHART_MARGIN;
    const { selectedPeriod, setPeriodRange, dataRun, reviewRange } = this.props;
    const { maxTimeSeries } = dataRun;
    const { xCoord } = this.getScale();
    const { dateRangeStart, dateRangeStop } = getSelectedRange(selectedPeriod, reviewRange, maxTimeSeries);

    const startRange = xCoord(dateRangeStart * 1000);
    const stopRange = xCoord(dateRangeStop * 1000);

    const zoomValue = d3.zoomIdentity.scale(focusChartWidth / (stopRange - startRange)).translate(-startRange, 0);
    selectedPeriod &&
      setPeriodRange({
        eventRange: [startRange, stopRange],
        zoomValue,
      });
  }

  updateZoomOnClick() {
    const { zoomDirection } = this.props;
    const { zoom } = this;
    const zoomInstance = d3.select('.zoom');

    if (zoomDirection === 'In') {
      zoom.scaleBy(zoomInstance, 1.03);
    } else {
      zoom.scaleBy(zoomInstance, 0.95);
    }
  }

  drawChartData() {
    const { width, height } = this.state;
    const { dataRun, isPredictionVisible, similarEvents } = this.props;
    const { eventWindows, timeSeries, timeseriesPred } = dataRun;
    const focusChartWidth = width - TRANSLATE_LEFT - 2 * CHART_MARGIN;

    let topSimilarEvents = similarEvents.slice(0, 6);
    return (
      width > 0 &&
      height > 0 && (
        <g className="focus" width={focusChartWidth} transform={`translate(${TRANSLATE_LEFT}, ${CHART_MARGIN})`}>
          <defs>
            <clipPath id="focusClip">
              <rect width={focusChartWidth} height={height} />
            </clipPath>
          </defs>
          <g className="chart-data" clipPath="url(#focusClip)">
            <g className="wawe-data">
              <path className="chart-wawes" d={this.drawLine(timeSeries)} />
              {isPredictionVisible && <path className="predictions" d={this.drawPredLine(timeseriesPred)} />}
            </g>
            <rect className="zoom" width={focusChartWidth} height={height} />
            {eventWindows.map((currentEvent) => this.renderEvents(currentEvent))}
            {topSimilarEvents.map((currentEvent) => this.renderSimilarEvents(currentEvent))}
          </g>
          <g className="chart-axis">
            <g className="axis axis--x" transform={`translate(0, ${height - 3.5 * CHART_MARGIN})`} />
            <g className="axis axis--y" />
          </g>
          <AddEvent />
        </g>
      )
    );
  }

  render() {
    const { width, height, isTooltipVisible } = this.state;
    return (
      <div className="focus-chart" id="focusChartWrapper">
        {isTooltipVisible && this.renderEventTooltip()}
        <ShowErrors isOpen={this.props.isPredictionVisible} />
        <EventDetails />
        <svg width={width} height={height} id="focusChart">
          {this.drawChartData()}
        </svg>
        <div className="zoomControlsHolder">
          <ZoomControls />
        </div>
      </div>
    );
  }
}

const mapState = (state: RootState) => ({
  dataRun: getDatarunDetails(state),
  isPredictionVisible: isPredictionEnabled(state),
  periodRange: getSelectedPeriodRange(state),
  isAddingNewEvent: getIsAddingNewEvents(state),
  selectedPeriod: getSelectedPeriodLevel(state),
  reviewRange: getReviewPeriod(state),
  zoomCounter: getZoomCounter(state),
  zoomDirection: getZoomOnClickDirection(state),
  isEditingRange: getIsEditingEventRange(state),
  similarEvents: getSimilarEvents(state),
  lastSearchedDatarunID: getLastSearchedDatarunID(state)
});

const mapDispatch = (dispatch: Function) => ({
  setPeriodRange: (period) => dispatch(setTimeseriesPeriod(period)),
  setActiveEvent: (eventID) => dispatch(setActiveEventAction(eventID)),
});

export default connect<StateProps, DispatchProps, {}, RootState>(mapState, mapDispatch)(FocusChart);
