import React, { Component } from 'react';
import * as d3 from 'd3';
import { connect } from 'react-redux';
import {
  getIsSimilarShapesModalOpen,
  getIsSimilarShapesLoading,
  getSimilarShapesCoords,
} from 'src/model/selectors/similarShapes';
import { RootState, DatarunDataType } from '../../../model/types';
import { formatDate } from '../../../model/utils/Utils';
import { FocusChartConstants } from '../FocusChart/Constants';
import {
  getCurrentEventDetails,
  getSelectedPeriodRange,
  getIsEditingEventRange,
  getIsAddingNewEvents,
  getIsPopupOpen,
  getSelectedDatarunID,
} from '../../../model/selectors/datarun';
import { setTimeseriesPeriod, selectDatarun } from '../../../model/actions/datarun';

const { TRANSLATE_LEFT, CHART_MARGIN } = FocusChartConstants;

type Props = {
  dataRun: DatarunDataType;
};

type ChartState = {
  width: number;
  height: number;
  drawableWidth: number;
  drawableHeight: number;
  offset?: {
    left?: number;
    top?: number;
    infoWidth?: number;
  };
};

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;
type ChartProps = StateProps & DispatchProps & Props;

export class DrawChart extends Component<ChartProps, ChartState> {
  private myCanvas = React.createRef<HTMLCanvasElement>();

  constructor(props) {
    super(props);
    this.state = {
      width: 0,
      height: 0,
      drawableWidth: 0,
      drawableHeight: 0,
      offset: {
        left: 10,
        top: 6,
        infoWidth: 60,
      },
    };
  }

  componentDidMount() {
    const width: number = document.querySelector('.time-row').clientWidth;
    const height = 50;
    const { offset } = this.state;

    const chartWidth = width - offset.infoWidth - 2 * offset.left;
    const drawableWidth = chartWidth - 3;
    const drawableHeight = height - 5;
    this.getRatio();

    this.setState(
      {
        width: chartWidth,
        height,
        drawableWidth,
        drawableHeight,
      },
      () => {
        this.initBrush();
      },
    );

    this.drawCanvas();
  }

  componentDidUpdate(prevProps) {
    if (JSON.stringify(prevProps.selectedPeriod.eventRange) !== JSON.stringify(this.props.selectedPeriod.eventRange)) {
      this.updateBrushes();
    }
    // this.drawCanvas();
  }

  private brush: any;

  getScale(width = this.state.width, height = this.state.height) {
    const { timeSeries, maxTimeSeries } = this.props.dataRun;

    let minValue = Number.MAX_SAFE_INTEGER;
    let maxValue = Number.MIN_SAFE_INTEGER;
    const timeSeriesMin = maxTimeSeries[0][0];
    const timeSeriesMax = maxTimeSeries[maxTimeSeries.length - 1][0];
    const xCoord = d3.scaleTime().range([0, width]);
    const yCoord = d3.scaleLinear().range([height, 0]);

    minValue = Math.min(minValue, timeSeriesMin);
    maxValue = Math.max(maxValue, timeSeriesMax);

    xCoord.domain([minValue, maxValue]);
    yCoord.domain(d3.extent(timeSeries, (t) => t[1]));

    return { xCoord, yCoord };
  }

  drawLine(data) {
    const { drawableWidth, drawableHeight } = this.state;
    const { xCoord, yCoord } = this.getScale(drawableWidth, drawableHeight);

    const line = d3
      .line()
      .x((d) => xCoord(d[0]))
      .y((d) => yCoord(d[1]));

    // TODO: depends on the current chart style
    line.curve(d3.curveStepAfter);
    return line(data);
  }

  initBrush() {
    const self = this;
    const { width } = this.state;
    const brushInstance = d3.selectAll('.overview-brush');

    const brush = d3.brushX().extent([
      [0, 0],
      [width, 42],
    ]);
    const { xCoord } = this.getScale();

    brushInstance
      .on('mousedown', function () {
        self.handleBrushClick((this as HTMLElement).getAttribute('id'));
      })
      .on('dblclick', function () {
        d3.select(this).call(self.brush.move, xCoord.range());
      })
      .call(brush);

    brush.on('brush', () => {
      this.handleBrushSelection();
    });
    this.brush = brush;
  }

  handleBrushDbClick(brushID) {
    const { xCoord } = this.getScale();
    d3.select(`#_${brushID}`).call(this.brush.move, xCoord.range());
  }

  getRatio() {
    const { width } = this.state;
    const focusChartWidth =
      document.querySelector('#focusChartWrapper').clientWidth - TRANSLATE_LEFT - 2 * CHART_MARGIN;
    const ratio = width / focusChartWidth;
    return { ratio };
  }

  handleBrushSelection() {
    const { isEditingEvent, isAddingNewEvent } = this.props;
    const selection = d3.event.selection && d3.event.selection;
    if (selection === null || isEditingEvent || isAddingNewEvent || selection[0] === selection[1]) {
      return;
    }
    const { ratio } = this.getRatio();
    const focusChartWidth = document.querySelector('#focusChartWrapper').clientWidth;
    const focusWidth = focusChartWidth - TRANSLATE_LEFT - 2 * CHART_MARGIN;
    const existingRange = this.props.selectedPeriod.eventRange;
    const eventRange = [selection[0] / ratio, selection[1] / ratio];

    // prevent infinite loop call
    if (JSON.stringify(existingRange) === JSON.stringify(eventRange)) {
      return;
    }

    const zoomValue = d3.zoomIdentity.scale(focusWidth / (eventRange[1] - eventRange[0])).translate(-eventRange[0], 0);

    const { xCoord } = this.getScale();
    const xCoordCopy = xCoord.copy();
    const timeStamp = zoomValue.rescaleX(xCoordCopy).domain();

    const selectedRange = {
      eventRange,
      zoomValue,
      timeStamp: [new Date(timeStamp[0]).getTime(), new Date(timeStamp[1]).getTime()],
    };

    if (d3.event && d3.event.sourceEvent && d3.event.sourceEvent.type !== 'zoom') {
      this.initTooltip();
      this.updateTooltipCoords();
    }

    selection && this.props.onChangePeriod(selectedRange);
  }

  updateBrush() {
    const { isEditingEvent, isAddingNewEvent } = this.props;
    if (isEditingEvent || isAddingNewEvent) {
      return;
    }
    const { ratio } = this.getRatio();
    const activeBrush = d3.select('.time-row.active g.overview-brush');
    const { eventRange } = this.props.selectedPeriod;

    const brushRange = [eventRange[0] * ratio, eventRange[1] * ratio];
    activeBrush.call(this.brush.move, brushRange);
  }

  getBrushRange(eventRange) {
    const { ratio } = this.getRatio();
    const chartStart = eventRange[0] * ratio;
    const chartEnd = eventRange[1] * ratio;
    return { chartStart, chartEnd };
  }

  updateBrushes() {
    const brushSelection = d3.selectAll('g.overview-brush');
    const { chartStart, chartEnd } = this.getBrushRange(this.props.selectedPeriod.eventRange);
    brushSelection.call(this.brush.move, [chartStart, chartEnd]);
  }

  handleBrushClick(dataRunID) {
    const { isEditingEvent, isAddingNewEvent, isPopupOpen } = this.props;
    !isEditingEvent && !isAddingNewEvent && !isPopupOpen && this.props.onSelectDatarun(dataRunID);
  }

  drawEvent(event) {
    const { timeSeries } = this.props.dataRun;
    const eventData: Array<[number, number]> = timeSeries.slice(event[0], event[1] + 2);
    return <path key={event[3]} className="wave-event" d={this.drawLine(eventData)} />;
  }

  renderSimilarShapes(shape) {
    const { start, end } = shape;

    return (
      <g className="similar-shape" key={start}>
        {this.drawEvent([start, end])}
      </g>
    );
  }

  drawData() {
    const { width, height, offset } = this.state;
    const { dataRun, isSimilarShapesLoading, isSimilarShapesOpen, similarShapesCoords, selectedDatarunID } = this.props;
    const { eventWindows, timeSeries } = dataRun;

    return (
      width > 0 &&
      height > 0 && (
        <g className="event-wrapper" transform={`translate(${offset.left}, ${offset.top})`}>
          <path className="wave-data" d={this.drawLine(timeSeries)} />
          {eventWindows.length > 0 && eventWindows.map((windowEvent) => this.drawEvent(windowEvent))}
          {isSimilarShapesOpen &&
            !isSimilarShapesLoading &&
            dataRun.id === selectedDatarunID &&
            similarShapesCoords.map((currentShape) => this.renderSimilarShapes(currentShape))}
        </g>
      )
    );
  }

  drawCanvas() {
    // const { offset } = this.state;
    // const { dataRun } = this.props;
    // const { timeSeries } = dataRun;
    // const ctx: CanvasRenderingContext2D = this.myCanvas.current.getContext('2d');
    // const { drawableWidth, drawableHeight } = this.state;
    // const { xCoord, yCoord } = this.getScale(drawableWidth, drawableHeight);
    // ctx.clearRect(0, 0, drawableWidth, drawableHeight);
    // const line = d3
    //   .line<[number, number]>()
    //   .x((d) => xCoord(d[0]) + 0.5 + offset.left)
    //   .y((d) => yCoord(d[1]) + offset.top)
    //   .curve(d3.curveStepAfter)
    //   .context(ctx);
    // ctx.beginPath();
    // line(timeSeries);
    // ctx.lineWidth = 1;
    // ctx.strokeStyle = 'rgb(36, 116, 241, 0.6)';
    // ctx.stroke();
  }

  initTooltip() {
    const { eventRange } = this.props.selectedPeriod;
    const rootTooltip = document.getElementById('brushTooltip');
    const { xCoord } = this.getScale();
    const startDate = formatDate(new Date(xCoord.invert(eventRange[0]).getTime()));
    const endDate = formatDate(new Date(xCoord.invert(eventRange[1]).getTime()));

    const tooltipDOM = `
      <ul>
        <li><span>starts:</span> <span>${startDate.day}/${startDate.month}/${startDate.year}</span> <span>${startDate.time}</span> </li>
        <li><span>ends:</span> <span>${endDate.day}/${endDate.month}/${endDate.year}</span> <span>${endDate.time}</span></li>
      </ul>`;

    rootTooltip.classList.add('active');
    rootTooltip.innerHTML = tooltipDOM;
  }

  handleTooltip() {
    const { eventRange } = this.props.selectedPeriod;
    const isBrushCreated = eventRange[0] !== 0 || eventRange[1] !== 0;
    if (!isBrushCreated) {
      return;
    }

    const selection = d3.selectAll('.overview-brush .selection');

    selection
      .on('mouseover', () => this.initTooltip())
      .on('mouseout', () => this.destroyTooltip())
      .on('mousemove', () => this.updateTooltipCoords());
  }

  updateTooltipCoords() {
    const { clientX, clientY } = d3.event.sourceEvent ? d3.event.sourceEvent : d3.event;

    const tooltip = document.getElementById('brushTooltip');

    if (clientX !== undefined && clientY !== undefined) {
      tooltip.setAttribute('style', `left: ${clientX + 10}px; top: ${clientY + 10}px`);
    }
  }

  destroyTooltip() {
    document.getElementById('brushTooltip').classList.remove('active');
    document.getElementById('brushTooltip').innerHTML = '';
  }

  render() {
    const { width, height } = this.state;

    return (
      <div style={{ position: 'relative' }}>
        {/* <canvas width={width} height={height} className="wave-chart-canvas" ref={this.myCanvas}></canvas> */}
        <svg width={width} height={height} className="wave-chart">
          {this.drawData()}
          <g
            className="overview-brush"
            width={width}
            height={height}
            id={this.props.dataRun.id}
            onMouseOver={() => this.handleTooltip()}
            onFocus={() => undefined}
            onMouseOut={() => this.destroyTooltip()}
            onBlur={() => undefined}
            transform="translate(9,3)"
          />
        </svg>
      </div>
    );
  }
}

const mapState = (state: RootState) => ({
  eventDetails: getCurrentEventDetails(state),
  selectedPeriod: getSelectedPeriodRange(state),
  isEditingEvent: getIsEditingEventRange(state),
  isAddingNewEvent: getIsAddingNewEvents(state),
  isPopupOpen: getIsPopupOpen(state),
  isSimilarShapesLoading: getIsSimilarShapesLoading(state),
  isSimilarShapesOpen: getIsSimilarShapesModalOpen(state),
  similarShapesCoords: getSimilarShapesCoords(state),
  selectedDatarunID: getSelectedDatarunID(state),
});

const mapDispatch = (dispatch: Function) => ({
  onSelectDatarun: (datarunID: string) => dispatch(selectDatarun(datarunID)),
  onChangePeriod: (period: { eventRange: Array<number>; zoomValue: object; timeStamp: Array<number> }) =>
    dispatch(setTimeseriesPeriod(period)),
});

export default connect<StateProps, DispatchProps, {}, RootState>(mapState, mapDispatch)(DrawChart);
