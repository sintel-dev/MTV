import React, { Component } from 'react';
import * as d3 from 'd3';
import { connect } from 'react-redux';
import {
  getIsSimilarShapesActive,
  getIsSimilarShapesLoading,
  getSimilarShapesCoords,
} from 'src/model/selectors/similarShapes';
import { resetSimilarShapesAction } from 'src/model/actions/similarShapes';
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
  getCurrentChartStyle,
} from '../../../model/selectors/datarun';
import { setTimeseriesPeriod, selectDatarun } from '../../../model/actions/datarun';

const { TRANSLATE_LEFT, CHART_MARGIN } = FocusChartConstants;

type OwnProps = {
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
type ChartProps = StateProps & DispatchProps & OwnProps;

type ShapeType = {
  end: number;
  start: number;
  similarity: number;
  source: string;
};

type DateFormat = {
  day: number;
  month: string;
  time: string;
  year: number;
};

export class DrawChart extends Component<ChartProps, ChartState> {
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
    const height = 40;
    const { offset } = this.state;

    const chartWidth: number = width - offset.infoWidth - 2 * offset.left;
    const drawableWidth: number = chartWidth - 3;
    const drawableHeight: number = height - 5;
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
  }

  componentDidUpdate(prevProps: ChartProps) {
    if (JSON.stringify(prevProps.selectedPeriod.eventRange) !== JSON.stringify(this.props.selectedPeriod.eventRange)) {
      this.updateBrushes();
    }
  }

  private brush: any;

  private getScale(width: number = this.state.width, height: number = this.state.height) {
    const { timeSeries, maxTimeSeries } = this.props.dataRun;

    let minValue: number = Number.MAX_SAFE_INTEGER;
    let maxValue: number = Number.MIN_SAFE_INTEGER;
    const timeSeriesMin: number = maxTimeSeries[0][0];
    const timeSeriesMax: number = maxTimeSeries[maxTimeSeries.length - 1][0];
    const xCoord = d3.scaleTime().range([0, width]);
    const yCoord = d3.scaleLinear().range([height, 0]);

    minValue = Math.min(minValue, timeSeriesMin);
    maxValue = Math.max(maxValue, timeSeriesMax);

    xCoord.domain([minValue, maxValue]);
    yCoord.domain(d3.extent(timeSeries, (t) => t[1]));

    return { xCoord, yCoord };
  }

  private drawLine(data: Array<[number, number]>) {
    const { drawableWidth, drawableHeight } = this.state;
    const { currentChartStyle } = this.props;
    const { xCoord, yCoord } = this.getScale(drawableWidth, drawableHeight);

    const line = d3
      .line()
      .x((d: Array<number>) => xCoord(d[0]))
      .y((d: Array<number>) => yCoord(d[1]));

    line.curve(currentChartStyle === 'linear' ? d3.curveLinear : d3.curveStepBefore);
    return line(data);
  }

  private initBrush() {
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

  private getRatio() {
    const { width } = this.state;
    const focusChartWidth: number =
      document.querySelector('#focusChartWrapper').clientWidth - TRANSLATE_LEFT - 2 * CHART_MARGIN;
    const ratio: number = width / focusChartWidth;
    return { ratio };
  }

  private handleBrushSelection() {
    const { isEditingEvent, isAddingNewEvent } = this.props;
    const selection = d3.event.selection && d3.event.selection;
    if (selection === null || isEditingEvent || isAddingNewEvent || selection[0] === selection[1]) {
      return;
    }

    const { ratio } = this.getRatio();
    const focusChartWidth: number = document.querySelector('#focusChartWrapper').clientWidth;
    const focusWidth: number = focusChartWidth - TRANSLATE_LEFT - 2 * CHART_MARGIN;
    const existingRange = this.props.selectedPeriod.eventRange as [number, number];
    const eventRange = [selection[0] / ratio, selection[1] / ratio] as [number, number];

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

  private getBrushRange(eventRange: number[]) {
    const { ratio } = this.getRatio();
    const chartStart = eventRange[0] * ratio;
    const chartEnd = eventRange[1] * ratio;
    return { chartStart, chartEnd };
  }

  private updateBrushes() {
    const brushSelection = d3.selectAll('g.overview-brush');
    const { chartStart, chartEnd } = this.getBrushRange(this.props.selectedPeriod.eventRange);
    brushSelection.call(this.brush.move, [chartStart, chartEnd]);
  }

  private handleBrushClick(dataRunID: string) {
    const { isEditingEvent, isAddingNewEvent, isPopupOpen, resetShapes } = this.props;
    resetShapes();
    !isEditingEvent && !isAddingNewEvent && !isPopupOpen && this.props.onSelectDatarun(dataRunID);
  }

  private drawEvent(event: [number, number]) {
    const { timeSeries } = this.props.dataRun;
    const [start, end] = event;
    const eventData: Array<[number, number]> = timeSeries.slice(start, end + 2);
    return <path key={event[1]} className="wave-event" d={this.drawLine(eventData)} />;
  }

  private renderEvents() {
    const { dataRun } = this.props;
    const { eventWindows } = dataRun;

    if (!eventWindows.length) {
      return null;
    }

    return eventWindows.map((currentEvent) => {
      const [start, end] = currentEvent;
      return this.drawEvent([start, end]);
    });
  }

  private renderSimilarShapes() {
    const {
      isSimilarShapesLoading,
      isSimilarShapesActive,
      similarShapesCoords,
      selectedDatarunID,
      dataRun,
    } = this.props;

    if (isSimilarShapesLoading || selectedDatarunID !== dataRun.id || !isSimilarShapesActive) {
      return null;
    }

    return similarShapesCoords.map((currentShape) => {
      const { start, end } = currentShape;
      return (
        <g className="similar-shape" key={start}>
          {this.drawEvent([start, end])}
        </g>
      );
    });
  }

  private drawData() {
    const { width, height, offset } = this.state;
    const { dataRun } = this.props;
    const { timeSeries } = dataRun;

    return (
      width > 0 &&
      height > 0 && (
        <g className="event-wrapper" transform={`translate(${offset.left}, ${offset.top})`}>
          <path className="wave-data" d={this.drawLine(timeSeries)} />
          {this.renderEvents()}
          {this.renderSimilarShapes()}
        </g>
      )
    );
  }

  private initTooltip() {
    const { eventRange } = this.props.selectedPeriod;
    const rootTooltip: HTMLElement = document.getElementById('brushTooltip');
    const { xCoord } = this.getScale();
    const startDate: DateFormat = formatDate(new Date(xCoord.invert(eventRange[0]).getTime()));
    const endDate: DateFormat = formatDate(new Date(xCoord.invert(eventRange[1]).getTime()));

    const tooltipDOM = `
      <ul>
        <li>
          <span>starts:</span>
          <span>${startDate.day}/${startDate.month}/${startDate.year}</span>
          <span>${startDate.time}</span>
        </li>
        <li>
          <span>ends:</span>
          <span>${endDate.day}/${endDate.month}/${endDate.year}</span>
          <span>${endDate.time}</span>
        </li>
      </ul>`;

    rootTooltip.classList.add('active');
    rootTooltip.innerHTML = tooltipDOM;
  }

  private handleTooltip() {
    const { eventRange } = this.props.selectedPeriod;
    const isBrushCreated: boolean = eventRange[0] !== 0 || eventRange[1] !== 0;
    if (!isBrushCreated) {
      return;
    }

    const selection = d3.selectAll('.overview-brush .selection');

    selection
      .on('mouseover', () => this.initTooltip())
      .on('mouseout', () => this.destroyTooltip())
      .on('mousemove', () => this.updateTooltipCoords());
  }

  private updateTooltipCoords() {
    const { clientX, clientY } = d3.event.sourceEvent ? d3.event.sourceEvent : d3.event;

    const tooltip: HTMLElement = document.getElementById('brushTooltip');

    if (clientX !== undefined && clientY !== undefined) {
      tooltip.setAttribute('style', `left: ${clientX + 10}px; top: ${clientY + 10}px`);
    }
  }

  private destroyTooltip() {
    document.getElementById('brushTooltip').classList.remove('active');
    document.getElementById('brushTooltip').innerHTML = '';
  }

  render() {
    const { width, height } = this.state;

    return (
      <div>
        <svg width={width} height={height} className="wave-chart">
          {this.drawData()}
          <g
            className="overview-brush"
            width={width}
            height={height}
            id={this.props.dataRun.id}
            onMouseOver={() => this.handleTooltip()}
            onMouseOut={() => this.destroyTooltip()}
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
  isSimilarShapesActive: getIsSimilarShapesActive(state),
  similarShapesCoords: getSimilarShapesCoords(state),
  selectedDatarunID: getSelectedDatarunID(state),
  currentChartStyle: getCurrentChartStyle(state),
});

const mapDispatch = (dispatch: Function) => ({
  onSelectDatarun: (datarunID: string) => dispatch(selectDatarun(datarunID)),
  onChangePeriod: (period: { eventRange: Array<number>; zoomValue: object; timeStamp: Array<number> }) =>
    dispatch(setTimeseriesPeriod(period)),
  resetShapes: () => dispatch(resetSimilarShapesAction()),
});

export default connect<StateProps, DispatchProps, {}, RootState>(mapState, mapDispatch)(DrawChart);
