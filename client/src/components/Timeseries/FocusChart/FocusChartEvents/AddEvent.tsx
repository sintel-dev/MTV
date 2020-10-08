import React, { Component } from 'react';
import { connect } from 'react-redux';
import { RootState } from 'src/model/types';
import * as d3 from 'd3';
import { setActivePanelAction } from 'src/model/actions/sidebar';
import {
  updateNewEventDetailsAction,
  updateEventDetailsAction,
  // openEventDetailsPopupAction,
} from 'src/model/actions/datarun';

import {
  getIsAddingNewEvents,
  getDatarunDetails,
  getSelectedPeriodRange,
  getIsEditingEventRange,
  getCurrentEventDetails,
  getIsAggregationActive,
  getNewEventDetails,
} from 'src/model/selectors/datarun';

import { FocusChartConstants } from '../Constants';
import { normalizeHanlers } from '../FocusChartUtils';

const { CHART_MARGIN, TRANSLATE_LEFT, MIN_VALUE, MAX_VALUE } = FocusChartConstants;

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;
type OwnProps = {
  height: number;
  width: number;
};

type Props = StateProps & DispatchProps & OwnProps;

export class AddEvents extends Component<Props> {
  componentDidMount() {
    this.renderBrush();
    normalizeHanlers('brush-instance');
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.isAddingNewEvent !== this.props.isAddingNewEvent ||
      prevProps.isEditingEventRange !== this.props.isEditingEventRange
    ) {
      this.renderBrush();
      normalizeHanlers('brush-instance');
    }

    if (this.props.height !== prevProps.height) {
      this.getScale();
      this.renderBrush();
    }
  }

  getScale() {
    const { width, height, dataRun } = this.props;
    const { maxTimeSeries } = dataRun;
    const [minTX, maxTX] = d3.extent(maxTimeSeries, (time) => time[0]) as [number, number];
    const [minTY, maxTY] = d3.extent(maxTimeSeries, (time) => time[1]) as [number, number];
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

  getBrushCoords() {
    const { currentEventDetails, isEditingEventRange, periodRange, newEventDetails } = this.props;
    const { zoomValue } = periodRange;
    const { xCoord } = this.getScale();

    let brushStart = 0;
    let brushEnd = 50;

    if (zoomValue !== undefined && zoomValue !== 1) {
      const xCoordCopy = xCoord.copy();
      xCoord.domain(zoomValue.rescaleX(xCoordCopy).domain());
    }

    if (newEventDetails !== null) {
      const { start_time, stop_time } = newEventDetails;

      brushStart = xCoord(start_time) || 0;
      brushEnd = xCoord(stop_time) || 50;
    }

    if (isEditingEventRange) {
      brushStart = xCoord(currentEventDetails.start_time);
      brushEnd = xCoord(currentEventDetails.stop_time);
    }

    return { brushStart, brushEnd };
  }

  renderBrush() {
    const { width, height } = this.props;
    const {
      dataRun,
      updateNewEventDetails,
      updateEventDetails,
      periodRange,
      isEditingEventRange,
      isAddingNewEvent,
    } = this.props;
    const { zoomValue } = periodRange;
    const { timeSeries } = dataRun;
    const { xCoord } = this.getScale();
    const { brushStart, brushEnd } = this.getBrushCoords();

    if (zoomValue !== undefined && zoomValue !== 1) {
      const xCoordCopy = xCoord.copy();
      xCoord.domain(zoomValue.rescaleX(xCoordCopy).domain());
    }

    const brushContext = d3.select('g.brush-instance');

    const brushInstance = d3
      .brushX()
      .extent([
        [0, 0],
        [width - 59, height - 3.5 * CHART_MARGIN],
      ])
      .on('brush start', () => {
        normalizeHanlers('brush-instance');
      })
      .on('brush', () => {
        normalizeHanlers('brush-instance');

        const { newEventDetails } = this.props;
        const [selection_start, selection_end] = d3.event.selection as [number, number];

        const startIndex: number =
          timeSeries.findIndex((element: Array<number>) => xCoord.invert(selection_start).getTime() - element[0] < 0) -
          1;
        const stopIndex: number = timeSeries.findIndex(
          (element: Array<number>) => xCoord.invert(selection_end).getTime() - element[0] < 0,
        );

        if (startIndex !== -1 && stopIndex !== -1) {
          const eventDetails = {
            ...newEventDetails,
            start_time: new Date(timeSeries[startIndex][0]).getTime(),
            stop_time: new Date(timeSeries[stopIndex][0]).getTime(),
          };

          // @TODO - investigate if really needed, updateEventDetails should do the trick
          if (isAddingNewEvent) {
            updateNewEventDetails({ ...eventDetails });
          }

          if (isEditingEventRange) {
            updateEventDetails({
              start_time: new Date(timeSeries[startIndex][0]).getTime(),
              stop_time: new Date(timeSeries[stopIndex][0]).getTime(),
            });
          }
        }
      })
      .on('end', () => {
        normalizeHanlers('brush-instance');
      });

    brushContext.call(brushInstance).call(brushInstance.move, [brushStart, brushEnd]);
  }

  render() {
    const { isAddingNewEvent, isEditingEventRange, toggleActivePanel } = this.props;

    return (isAddingNewEvent || isEditingEventRange) && <g className="brush-instance" onClick={toggleActivePanel} />;
  }
}

const mapState = (state: RootState) => ({
  dataRun: getDatarunDetails(state),
  isAddingNewEvent: getIsAddingNewEvents(state),
  periodRange: getSelectedPeriodRange(state),
  isEditingEventRange: getIsEditingEventRange(state),
  currentEventDetails: getCurrentEventDetails(state),
  isAggregationActive: getIsAggregationActive(state),
  newEventDetails: getNewEventDetails(state),
});

const mapDispatch = (dispatch: Function) => ({
  updateNewEventDetails: (eventDetails) => dispatch(updateNewEventDetailsAction(eventDetails)),
  updateEventDetails: (eventDetails) => dispatch(updateEventDetailsAction(eventDetails)),
  toggleActivePanel: () => dispatch(setActivePanelAction('eventView')),
});

export default connect<StateProps, DispatchProps, {}, RootState>(mapState, mapDispatch)(AddEvents);
