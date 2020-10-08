import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as d3 from 'd3';
import { getIsSimilarShapesActive, getSimilarShapesCoords, getActiveShape } from 'src/model/selectors/similarShapes';
import { setActiveShapeAction } from 'src/model/actions/similarShapes';
import {
  getDatarunDetails,
  isPredictionEnabled,
  getSelectedPeriodRange,
  getSelectedPeriodLevel,
  getZoomCounter,
  getZoomOnClickDirection,
  getIsEditingEventRange,
  getZoomMode,
  getIsTimeSyncModeEnabled,
  getScrollHistory,
  getCurrentEventDetails,
  getActiveEventID,
  getCurrentChartStyle,
  getIsAggregationActive,
} from 'src/model/selectors/datarun';
import { setTimeseriesPeriod, setActiveEventAction } from 'src/model/actions/datarun';
import { RootState } from 'src/model/types';
import { formatDate } from 'src/model/utils/Utils';
import { FocusChartConstants, colorSchemes } from './Constants';

import AddEvent from './FocusChartEvents/AddEvent';
import ShowErrors from './ShowErrors';
import { getWrapperSize, getSelectedRange } from './FocusChartUtils';
import ZoomControls from './ZoomControls';
import AggregationLevels from '../AggregationLevels/AggregationLevels';
import './FocusChart.scss';

const { TRANSLATE_LEFT, CHART_MARGIN, MIN_VALUE, MAX_VALUE, TRANSLATE_TOP } = FocusChartConstants;

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
  zoomWidth: number;
};

type dateFormat = {
  year: number | null;
  month: string | null;
  day: number | null;
  time: string | null;
};

type eventType = Array<[number, number, number, string, null | number]>;

export class FocusChart extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      width: 0,
      height: 0,
      isTooltipVisible: false,
      eventData: {},
      zoomWidth: 0,
    };
  }

  componentDidMount() {
    const { width, height } = getWrapperSize();
    this.setState(
      {
        width,
        height: height + TRANSLATE_TOP,
        zoomWidth: width - TRANSLATE_LEFT - 2 * CHART_MARGIN,
      },
      () => {
        this.initZoom();
        this.renderChartAxis();
      },
    );
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.isAggregationActive !== this.props.isAggregationActive && !this.props.isAggregationActive) {
      this.renderChartAxis();
      this.initZoom();
    }

    if (!this.props.isAggregationActive) {
      if (prevProps.periodRange.zoomValue !== this.props.periodRange.zoomValue) {
        this.updateZoom();
      }

      if (prevProps.selectedPeriod !== this.props.selectedPeriod) {
        this.updateChartZoomOnSelectPeriod();
      }
      if (prevProps.zoomCounter !== this.props.zoomCounter) {
        this.updateZoomOnClick();
      }

      if (prevProps.isEditingRange !== this.props.isEditingRange) {
        this.toggleZoom();
      }
    }
    if (prevProps.isPredictionVisible !== this.props.isPredictionVisible) {
      this.setChartHeight();
    }
    if (prevProps.dataRun.id !== this.props.dataRun.id) {
      this.renderChartAxis();
    }
  }

  private zoom: any;

  getScale() {
    const { width, height } = this.state;
    const { dataRun } = this.props;

    const { maxTimeSeries, timeSeries } = dataRun;
    const [minDtTX, maxDtTX] = d3.extent(timeSeries, (time: Array<number>) => time[0]) as [number, number];
    const [minTX, maxTX] = d3.extent(maxTimeSeries, (time: Array<number>) => time[0]) as [number, number];
    const [minTY, maxTY] = d3.extent(timeSeries, (time: Array<number>) => time[1]) as [number, number];
    const drawableWidth: number = width - 2 * CHART_MARGIN - TRANSLATE_LEFT;
    const drawableHeight: number = height - 3.5 * CHART_MARGIN;

    const xCoord = d3.scaleTime().range([0, drawableWidth]);
    const yCoord = d3.scaleLinear().range([drawableHeight, 0]);

    const minDtX: number = Math.min(MIN_VALUE, minDtTX);
    const maxDtX: number = Math.max(MAX_VALUE, maxDtTX);

    const minX: number = Math.min(MIN_VALUE, minTX);
    const maxX: number = Math.max(MAX_VALUE, maxTX);

    const minY: number = Math.min(MIN_VALUE, minTY);
    const maxY: number = Math.max(MAX_VALUE, maxTY);

    const maxDtXCood = xCoord.domain([minDtX, maxDtX]);
    xCoord.domain([minX, maxX]);
    yCoord.domain([minY, maxY]);

    return { xCoord, yCoord, maxDtXCood };
  }

  drawLine(data: Array<[number, number]>) {
    const { periodRange, currentChartStyle } = this.props;
    const { zoomValue } = periodRange;
    const { xCoord, yCoord } = this.getScale();
    const xCoordCopy = xCoord.copy();
    if (zoomValue !== 1) {
      xCoord.domain((zoomValue as any).rescaleX(xCoordCopy).domain());
    }

    const line = d3
      .line()
      .x((d) => xCoord(d[0]))
      .y((d) => yCoord(d[1]));

    line.curve(currentChartStyle === 'linear' ? d3.curveLinear : d3.curveStepBefore);
    return line(data);
  }

  renderEventTooltip() {
    const { eventData, isTooltipVisible } = this.state;
    if (!isTooltipVisible) {
      return null;
    }

    const startDate: dateFormat = formatDate(eventData.startDate);
    const endDate: dateFormat = formatDate(eventData.stopDate);

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

  renderSimilarShapes(shape) {
    const { dataRun, periodRange, activeShape, setActiveShape } = this.props;
    const { timeSeries } = dataRun;
    const { height } = this.state;
    const { xCoord } = this.getScale();
    const xCoordCopy = xCoord.copy();
    const { start, end } = shape;

    if (periodRange.zoomValue !== 1) {
      xCoord.domain(periodRange.zoomValue.rescaleX(xCoordCopy).domain());
    }

    const shapeWidth = Math.max(xCoord(timeSeries[end][0]) - xCoord(timeSeries[start][0]));
    const shapeHeight = height - 3.5 * CHART_MARGIN;
    const translateShape = xCoord(timeSeries[start][0]);
    const tagColor = colorSchemes[shape.tag] || colorSchemes.Untagged;
    const isShapeActive =
      activeShape && activeShape.start === shape.start && activeShape.end === shape.end ? 'active' : '';

    return (
      <g className={`similar-shape ${isShapeActive}`} key={start} onClick={() => setActiveShape(shape)}>
        <rect className="evt-area" width={shapeWidth} height={shapeHeight} y={0} x={translateShape} />
        <rect className="evt-comment" width={shapeWidth} height="10" y={1} x={translateShape} fill={tagColor} />
      </g>
    );
  }

  toggleEventTooltip(tooltipState) {
    this.setState({
      isTooltipVisible: tooltipState,
    });
  }

  renderEventArea(currentEvent: Array<any>) {
    const { dataRun, periodRange, setActiveEvent, activeEventID } = this.props;
    const { timeSeries } = dataRun;
    const { height } = this.state;

    const { xCoord } = this.getScale();
    const xCoordCopy = xCoord.copy();
    const commentHeight = height - 3.5 * CHART_MARGIN;

    let startIndex = Math.max(currentEvent[0], 0);
    let stopIndex = Math.max(currentEvent[1], 0);

    const event = timeSeries.slice(startIndex, stopIndex + 1) as Array<[number, number]>;

    // if there's a zoom level
    if (periodRange.zoomValue !== 1) {
      xCoord.domain((periodRange.zoomValue as any).rescaleX(xCoordCopy).domain());
    }

    const commentWidth: number = Math.max(xCoord(timeSeries[stopIndex][0]) - xCoord(timeSeries[startIndex][0]));
    const translateComment: number = xCoord(timeSeries[startIndex][0]);
    const tagColor: string = colorSchemes[currentEvent[4]] || colorSchemes.Untagged;

    const startDate: object = new Date(timeSeries[startIndex][0]);
    const stopDate: object = new Date(timeSeries[stopIndex][0]);

    const pathClassName: string = currentEvent[4]?.replace(/\s/g, '_').toLowerCase() || 'untagged';
    const activeClass: string = currentEvent[3] === activeEventID ? 'active' : '';

    return (
      <g
        className="line-highlight"
        key={currentEvent[3]}
        id={`_${currentEvent[3]}`}
        onClick={() => setActiveEvent(currentEvent[3])}
        onMouseMove={(evt) => {
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
        onMouseLeave={() => this.toggleEventTooltip(false)}
      >
        <path className={`evt-highlight ${pathClassName}`} d={this.drawLine(event)} />
        <g className="event-comment">
          <rect
            className={`evt-area ${activeClass}`}
            width={commentWidth}
            height={commentHeight}
            y={0}
            x={translateComment}
          />
          <rect className="evt-comment" height="10" width={commentWidth} y="0" x={translateComment} fill={tagColor} />
        </g>
      </g>
    );
  }

  renderEvents() {
    const { dataRun, selectedEventDetails, isSimilarShapesActive } = this.props;

    const { eventWindows } = dataRun;

    if (isSimilarShapesActive) {
      const eventIndex: number = eventWindows.findIndex(
        (currentWindow) => currentWindow[3] === selectedEventDetails.id,
      );
      return this.renderEventArea(eventWindows[eventIndex]);
    }

    return eventWindows.map((currentWindow) => this.renderEventArea(currentWindow));
  }

  renderChartAxis() {
    const { periodRange } = this.props;
    const { xCoord, yCoord } = this.getScale();
    const xCoordCopy = xCoord.copy();

    // if there's a zoom level
    if (periodRange.zoomValue !== 1) {
      xCoord.domain(periodRange.zoomValue.rescaleX(xCoordCopy).domain());
    }
    const xAxis = d3.axisBottom(xCoord);
    const yAxis = d3.axisLeft(yCoord);

    d3.select('.axis.axis--x').call(xAxis);
    d3.select('.axis.axis--y')
      .call(yAxis)
      .call(yAxis.ticks(5, ',f').tickFormat(d3.format('.4s')));

    this.renderChartGrid();
  }

  renderChartGrid() {
    const { yCoord } = this.getScale();
    const { width } = this.state;
    const chartWidth: number = width - TRANSLATE_LEFT - 2 * CHART_MARGIN;
    const drawGridLines = () => d3.axisLeft(yCoord).ticks(5);
    d3.select('#gridLines').call(drawGridLines().tickSize(-chartWidth));
  }

  initZoom() {
    const { width, height, zoomWidth } = this.state;
    // const zoomWidth: number = width - TRANSLATE_LEFT - 2 * CHART_MARGIN;
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
    const zoomKvalue: number = Math.min(Math.floor(periodRange.zoomValue.k), 3);
    d3.select('.zoom').call(this.zoom.transform, periodRange.zoomValue);
    d3.select('.focus-chart path.chart-wawes').style('stroke-width', zoomKvalue);
    d3.select('.focus-chart path.predictions').style('stroke-width', zoomKvalue);
    d3.selectAll('.focus-chart path.evt-highlight').style('stroke-width', zoomKvalue);
    this.renderChartAxis();
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

    /**
     * eventRange: Array<[number, number]>
     * Operator '<' cannot be applied to types '[number, number]' and 'number'.
     */
    const eventRange = xCoord.range().map(zoomValue.invertX, zoomValue);
    const periodRange: object = {
      eventRange: [eventRange[0] < 0 ? 0 : eventRange[0], eventRange[1]],
      zoomValue,
    };

    this.rangeToTimestamp(periodRange);
  }

  toggleZoom() {
    const { zoomWidth } = this.state;
    const { isEditingRange } = this.props;
    if (isEditingRange) {
      d3.select('.zoom').attr('width', 0);
    } else {
      d3.select('.zoom').attr('width', zoomWidth);
    }
  }

  rangeToTimestamp(periodRange) {
    const { zoomValue } = periodRange;
    const { maxDtXCood } = this.getScale();
    const xCoordCopy = maxDtXCood.copy();
    const timeStamp: object = zoomValue.rescaleX(xCoordCopy.copy()).domain();
    const timestampStart: number = new Date(timeStamp[0]).getTime();
    const timestampStop: number = new Date(timeStamp[1]).getTime();
    this.props.setPeriodRange({ ...periodRange, timeStamp: [timestampStart, timestampStop] });
  }

  updateChartZoomOnSelectPeriod() {
    const { width } = this.state;
    const focusChartWidth: number = width - TRANSLATE_LEFT - 2 * CHART_MARGIN;
    const { selectedPeriod, setPeriodRange, dataRun } = this.props;
    const { maxTimeSeries } = dataRun;
    const { xCoord } = this.getScale();
    const { dateRangeStart, dateRangeStop } = getSelectedRange(selectedPeriod, maxTimeSeries);

    const startRange: number = xCoord(dateRangeStart * 1000) < 0 ? 0 : xCoord(dateRangeStart * 1000);
    const stopRange: number = xCoord(dateRangeStop * 1000);
    const zoomValue = d3.zoomIdentity.scale(focusChartWidth / (stopRange - startRange)).translate(-startRange, 0);

    const xCoordCopy = xCoord.copy();
    const timeStamp: Array<any> = zoomValue.rescaleX(xCoordCopy).domain();
    const timestampStart: number = new Date(timeStamp[0]).getTime();
    const timestampStop: number = new Date(timeStamp[1]).getTime();

    selectedPeriod &&
      setPeriodRange({
        eventRange: [startRange, stopRange],
        zoomValue,
        timeStamp: [timestampStart, timestampStop],
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

  setChartHeight() {
    const { isPredictionVisible } = this.props;
    const { height } = this.state;
    const chartHeight: number = isPredictionVisible ? height - TRANSLATE_TOP : height + TRANSLATE_TOP;
    this.setState(
      {
        height: chartHeight,
      },
      () => this.renderChartAxis(),
    );
  }

  drawChartData() {
    const { width, height } = this.state;
    const { dataRun, isPredictionVisible, isZoomEnabled, isSimilarShapesActive, similarShapesCoords } = this.props;
    const { timeSeries, timeseriesPred } = dataRun;
    const focusChartWidth: number = width - TRANSLATE_LEFT - 2 * CHART_MARGIN;

    const zoomProps = {
      width: isZoomEnabled ? focusChartWidth : 0,
      height: isZoomEnabled ? height : 0,
    };

    return (
      width > 0 &&
      height > 0 && (
        <g className="focus" width={focusChartWidth} transform={`translate(${TRANSLATE_LEFT}, ${CHART_MARGIN})`}>
          <defs>
            <clipPath id="focusClip">
              <rect width={focusChartWidth} height={height} />
            </clipPath>
          </defs>
          <g id="gridLines" className="grid-lines" />
          <g className="chart-data" clipPath="url(#focusClip)">
            <g className="wawe-data">
              <path className="chart-wawes" d={this.drawLine(timeSeries)} />
              {isPredictionVisible && <path className="predictions" d={this.drawLine(timeseriesPred)} />}
            </g>
            <rect className="zoom" {...zoomProps} />
            {this.renderEvents()}
            {isSimilarShapesActive &&
              similarShapesCoords !== null &&
              similarShapesCoords.map((currentShapeCoords) => this.renderSimilarShapes(currentShapeCoords))}
          </g>
          <g className="chart-axis">
            <g className="axis axis--x" transform={`translate(0, ${height - 3.5 * CHART_MARGIN})`} />
            <g className="axis axis--y" />
          </g>
          <AddEvent width={width} height={height} />
        </g>
      )
    );
  }

  render() {
    const { isAggregationActive } = this.props;
    const { width, height } = this.state;
    return (
      <div className="focus-chart" id="focusChartWrapper">
        {this.renderEventTooltip()}
        <ShowErrors />
        {isAggregationActive ? (
          <AggregationLevels width={width} height={height} toggleTooltip={() => this.toggleEventTooltip(false)} />
        ) : (
          <>
            <svg width={width} height={height} id="focusChart">
              {this.drawChartData()}
            </svg>
            <div className="zoomControlsHolder">
              <ZoomControls />
            </div>
          </>
        )}
      </div>
    );
  }
}

const mapState = (state: RootState) => ({
  dataRun: getDatarunDetails(state),
  isPredictionVisible: isPredictionEnabled(state),
  periodRange: getSelectedPeriodRange(state),
  selectedPeriod: getSelectedPeriodLevel(state),
  zoomCounter: getZoomCounter(state),
  zoomDirection: getZoomOnClickDirection(state),
  isEditingRange: getIsEditingEventRange(state),
  isZoomEnabled: getZoomMode(state),
  isTimeSyncEnbled: getIsTimeSyncModeEnabled(state),
  scrollHistory: getScrollHistory(state),
  isSimilarShapesActive: getIsSimilarShapesActive(state),
  similarShapesCoords: getSimilarShapesCoords(state),
  selectedEventDetails: getCurrentEventDetails(state),
  activeShape: getActiveShape(state),
  activeEventID: getActiveEventID(state),
  currentChartStyle: getCurrentChartStyle(state),
  isAggregationActive: getIsAggregationActive(state),
});

const mapDispatch = (dispatch: Function) => ({
  setPeriodRange: (period) => dispatch(setTimeseriesPeriod(period)),
  setActiveEvent: (eventID) => dispatch(setActiveEventAction(eventID)),
  setActiveShape: (shape) => dispatch(setActiveShapeAction(shape)),
});

export default connect<StateProps, DispatchProps, {}, RootState>(mapState, mapDispatch)(FocusChart);
