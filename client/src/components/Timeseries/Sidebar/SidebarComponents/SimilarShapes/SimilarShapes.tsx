import React, { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import * as d3 from 'd3';
import './SimilarShapes.scss';
import {
  toggleSimilarShapesAction,
  getSimilarShapesAction,
  saveSimilarShapesAction,
  resetSimilarShapesAction,
  shapesTagsOverrideAction,
  setActiveShapeAction,
  changeActiveShapeTagAction,
  changeMetricsAction,
  deleteShapeAction,
  resetShapesTagsAction,
} from 'src/model/actions/similarShapes';
import { getCurrentEventDetails, getDatarunDetails } from 'src/model/selectors/datarun';
import { getIsEditingEventRange } from 'src/model/selectors/events';
import {
  getIsSimilarShapesLoading,
  getSimilarShapesCoords,
  getIsSimilarShapesActive,
  getActiveShape,
  getCurrentShapeMetrics,
  getCurrentShapesTag,
  getIsResetSimilarDisabled,
  similarShapesResults,
} from 'src/model/selectors/similarShapes';
import { timestampToDate } from 'src/components/Timeseries/AggregationLevels/AggregationChart/Utils';
import { setActiveEventAction } from 'src/model/actions/events';
import Dropdown from 'src/components/Common/Dropdown';
import { colorSchemes } from 'src/components/Timeseries/FocusChart/Constants';
import { RootState } from 'src/model/types';
import { selectedOption } from '../EventDetailsView/eventUtils';
import FilterShapes from './FilterShapes';

const shapesLanding = (): ReactNode => (
  <div className="shapes-landing">
    <p>
      Select an Event in <br /> order to see Similar Segments
    </p>
  </div>
);

const shapesLoader = (): ReactNode => (
  <div className="shapes-landing">
    <p>Loading</p>
  </div>
);

const noShapesFound = (): ReactNode => (
  <div className="shapes-landing">
    <p>No shapes have been found for the selected interval</p>
  </div>
);

const getShapesResultHeight = (visibility: boolean): { maxHeight: string } => {
  const maxHeight = visibility ? '30.3vh' : '38.3vh';
  return { maxHeight };
};

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;
type Props = StateProps & DispatchProps;
type State = {
  isShapeFilteringVisible: boolean;
};

class SimilarShapes extends Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      isShapeFilteringVisible: true,
    };
  }

  componentDidMount() {
    this.props.resetSimilarShapes();
  }

  componentDidUpdate(prevProps: Props) {
    const { currentEvent } = this.props;
    const currentEventID: string | null =
      (currentEvent && currentEvent.id) || (prevProps.currentEvent && prevProps.currentEvent.id) || null;

    if (prevProps.currentEvent && prevProps.currentEvent.id !== currentEventID) {
      this.props.resetSimilarShapes();
    }

    const activeShape = document.querySelector('.shape-details.active');
    activeShape && activeShape.scrollIntoView();
  }

  private getScale(data, data2): { xCoord: Function; yCoord: Function } {
    const MIN_VALUE = Number.MAX_SAFE_INTEGER;
    const MAX_VALUE = Number.MIN_SAFE_INTEGER;
    const width = 210;
    const height = 122;
    const xCoord = d3.scaleTime().range([0, width]);
    const yCoord = d3.scaleLinear().range([height, 0]);

    const [minTX, maxTX] = d3.extent(data, (time: Array<number>) => time[0]) as [number, number];
    const [minTY, maxTY] = d3.extent(data, (time: Array<number>) => time[1]) as [number, number];
    const [minTY2, maxTY2] = d3.extent(data2, (time: Array<number>) => time[1]) as [number, number];

    const minX: number = Math.min(MIN_VALUE, minTX);
    const maxX: number = Math.max(MAX_VALUE, maxTX);

    const minY: number = Math.min(MIN_VALUE, minTY, minTY2);
    const maxY: number = Math.max(MAX_VALUE, maxTY, maxTY2);

    xCoord.domain([minX, maxX]);
    yCoord.domain([minY, maxY]);

    return { xCoord, yCoord };
  }

  private drawLine(event: Array<[number, number]>, event2: Array<[number, number]>) {
    const { xCoord, yCoord } = this.getScale(event, event2);
    const line = d3
      .line()
      .x((d) => xCoord(d[0]))
      .y((d) => yCoord(d[1]));
    return line(event);
  }

  private getShapeDetails(shape: {
    start: number;
    end: number;
    similarity: number;
    source: string;
  }): { startTime: ReactNode; stopTime: ReactNode; similarity: string; eventInterval: Array<[number, number]> } {
    const { timeSeries } = this.props.dataRun;
    const { start, end, similarity } = shape;
    const startTime = timeSeries[start][0];
    const stopTime = timeSeries[end][0];

    const eventInterval = timeSeries.slice(start, end);
    const format = d3.format('.2f');
    return {
      startTime: timestampToDate(startTime),
      stopTime: timestampToDate(stopTime),
      similarity: format(similarity * 100),
      eventInterval,
    };
  }

  private getCurrentEventShape(): Array<[number, number]> {
    const { currentEvent, dataRun } = this.props;
    const { timeSeries } = dataRun;
    const { start_time, stop_time } = currentEvent;
    const startIndex: number = timeSeries.findIndex((currentSeries) => currentSeries[0] === start_time);
    const stopIndex: number = timeSeries.findIndex((currentSeries) => currentSeries[0] === stop_time);
    const eventInterval: Array<[number, number]> = timeSeries.slice(startIndex, stopIndex + 1);
    return eventInterval;
  }

  private renderShapeFooter(): ReactNode {
    const {
      deleteShape,
      saveShapes,
      similarShapes,
      currentEvent,
      activeShape,
      resetShapesTags,
      isRsetBtnDisabled,
      resetSimilarShapes,
    } = this.props;

    if (!similarShapes.length || currentEvent === null) {
      return null;
    }

    return (
      <div className="shape-footer">
        <ul>
          <li>
            <button type="button" className="clean delete" onClick={deleteShape} disabled={!activeShape}>
              Delete_Seg
            </button>
          </li>
          <li>
            <button
              type="button"
              className="clean delete"
              onClick={() => resetShapesTags()}
              disabled={isRsetBtnDisabled}
            >
              Reset_Tags
            </button>
          </li>
        </ul>
        <ul>
          <li>
            <button type="button" className="clean" onClick={() => resetSimilarShapes()}>
              Cancel
            </button>
          </li>
          <li>
            <button type="button" className="save" onClick={saveShapes}>
              Save changes
            </button>
          </li>
        </ul>
      </div>
    );
  }

  private renderShapes(): ReactNode {
    const { similarShapes, currentEvent, activeShape, setActiveShape, changeShapeTag } = this.props;
    if (currentEvent === null) {
      return null;
    }
    const currentEventShape: Array<[number, number]> = this.getCurrentEventShape();

    return similarShapes.map((currentShape) => {
      const { startTime, stopTime, similarity, eventInterval } = this.getShapeDetails(currentShape);
      const shapeClassName =
        activeShape && activeShape.start === currentShape.start && activeShape.end === currentShape.end ? 'active' : '';

      return (
        <div
          className={`shape-details ${shapeClassName}`}
          key={currentShape.start}
          onClick={() => setActiveShape(currentShape)}
        >
          <table className="info">
            <tbody>
              <tr>
                <th>Start:</th>
                <td>{startTime}</td>
              </tr>
              <tr>
                <th>End:</th>
                <td>{stopTime}</td>
              </tr>
              <tr>
                <th>Similarity:</th>
                <td>{similarity}%</td>
              </tr>
              <tr>
                <th>Tag</th>
                <td>
                  <Dropdown onChange={(tag) => changeShapeTag(tag.value)} value={selectedOption(currentShape.tag)} />
                </td>
              </tr>
            </tbody>
          </table>
          <div className="drawing">
            <svg width="134" height="127" className="shape-chart">
              <path d={this.drawLine(eventInterval, currentEventShape)} className="similar-shape" />
              <path
                d={this.drawLine(currentEventShape, eventInterval)}
                stroke={colorSchemes[currentEvent.tag] || '#D5D5D5'}
              />
            </svg>
          </div>
        </div>
      );
    });
  }

  private renderEventData(): ReactNode {
    const { currentEvent } = this.props;
    const { start_time, stop_time } = currentEvent || { start_time: null, stop_time: null };

    return (
      <div className="form-row">
        <div className="form-wrapper">
          <label htmlFor="from">From</label>
          {(start_time !== null && timestampToDate(start_time)) || <p>-</p>}
        </div>
        <div className="form-wrapper">
          <label htmlFor="to">To</label>
          {(stop_time !== null && timestampToDate(stop_time)) || <p>-</p>}
        </div>
      </div>
    );
  }

  private renderShapeOptions(): ReactNode {
    const { currentEvent, similarShapes, activeMetric, changeShapeMetric } = this.props;
    if (similarShapes.length) {
      return null;
    }

    return (
      <div className="form-row">
        <div className="form-wrapper">
          <label htmlFor="algorithm">Select Algorithm</label>
        </div>
        <div className="form-wrapper">
          <ul className="algorithms">
            <li>
              <input
                type="radio"
                name="algotitm"
                id="euclidian"
                checked={activeMetric === 'euclidean'}
                disabled={currentEvent === null}
                onChange={() => changeShapeMetric('euclidean')}
              />
              <label htmlFor="euclidian">
                <span />
                Euclidean
              </label>
            </li>
            <li>
              <input
                type="radio"
                name="algotitm"
                id="dtw"
                checked={activeMetric === 'dtw'}
                disabled={currentEvent === null}
                onChange={() => changeShapeMetric('dtw')}
              />
              <label htmlFor="dtw">
                <span />
                DTW
              </label>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  private toggleShapesFiltering(): void {
    const { isShapeFilteringVisible } = this.state;
    this.setState({
      isShapeFilteringVisible: !isShapeFilteringVisible,
    });
  }

  private shapeTagOverride(): ReactNode {
    const { overrideAllTags, currentShapesTag, similarShapes } = this.props;

    return (
      <div className="shape-form overwrite">
        <div className="form-row">
          <div className="form-wrapper ">
            <p>Override all segments tags</p>
            <p className="recent">{similarShapes.length} similar segments</p>
          </div>
          <div className="form-wrapper">
            <div className="shape-options">
              <Dropdown value={selectedOption(currentShapesTag)} onChange={(tag) => overrideAllTags(tag.value)} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderSearchControls(): ReactNode {
    const {
      currentEvent,
      getSimilarShapes,
      similarShapes,
      isSimilarShapesLoading,
      isEditingEventRange,
      isSimilarShapesActive,
      setActiveEvent,
    } = this.props;
    const isSearchDisabled: boolean =
      currentEvent === null || (!similarShapes.length && isSimilarShapesLoading) || isEditingEventRange;

    const searchControls: ReactNode = (
      <>
        <div className="submit">
          <ul>
            <li>
              <button className="clean" type="button" onClick={() => setActiveEvent(null)} disabled={isSearchDisabled}>
                CANCEL
              </button>
            </li>
            <li>
              <button
                className="clean trigger"
                type="button"
                onClick={() => getSimilarShapes()}
                disabled={isSearchDisabled}
              >
                SEARCH SIMILAR
              </button>
            </li>
          </ul>
        </div>
        <div className="clear" />
      </>
    );

    if (currentEvent === null) {
      return shapesLanding();
    }

    if (similarShapes.length) {
      return this.shapeTagOverride();
    }

    if (!isSimilarShapesLoading && isSimilarShapesActive && !similarShapes.length) {
      return noShapesFound();
    }

    return searchControls;
  }

  renderShapeFormular(): ReactNode {
    const { currentEvent, isEditingEventRange, isSimilarShapesLoading, rawShapes, isSimilarShapesActive } = this.props;
    const shapesDisabled: string = currentEvent === null || isEditingEventRange ? 'disabled' : '';
    const { isShapeFilteringVisible } = this.state;

    return (
      <div className={`shapes-option ${shapesDisabled}`}>
        <div className="shape-container">
          <div className="shape-form">
            {this.renderEventData()}
            {rawShapes.length !== 0 && isSimilarShapesActive && (
              <FilterShapes
                toggleShapesFiltering={() => this.toggleShapesFiltering()}
                isShapeFilteringVisible={isShapeFilteringVisible}
              />
            )}
            {this.renderShapeOptions()}
          </div>
          {this.renderSearchControls()}
          {isSimilarShapesLoading ? (
            shapesLoader()
          ) : (
            <div className="shapes-results scroll-style" style={getShapesResultHeight(isShapeFilteringVisible)}>
              {this.renderShapes()}
            </div>
          )}
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="similar-shapes-wrapper">
        {this.renderShapeFormular()} {this.renderShapeFooter()}
      </div>
    );
  }
}

const mapState = (state: RootState) => ({
  currentEvent: getCurrentEventDetails(state),
  similarShapes: getSimilarShapesCoords(state),
  dataRun: getDatarunDetails(state),
  isSimilarShapesLoading: getIsSimilarShapesLoading(state),
  isSimilarShapesActive: getIsSimilarShapesActive(state),
  isEditingEventRange: getIsEditingEventRange(state),
  activeShape: getActiveShape(state),
  activeMetric: getCurrentShapeMetrics(state),
  currentShapesTag: getCurrentShapesTag(state),
  isRsetBtnDisabled: getIsResetSimilarDisabled(state),
  rawShapes: similarShapesResults(state),
});

const mapDispatch = (dispatch: Function) => ({
  toggleSimilarShapes: (state) => dispatch(toggleSimilarShapesAction(state)),
  getSimilarShapes: () => dispatch(getSimilarShapesAction()),
  saveShapes: () => dispatch(saveSimilarShapesAction()),
  setActiveEvent: (eventID) => dispatch(setActiveEventAction(eventID)),
  resetSimilarShapes: () => dispatch(resetSimilarShapesAction()),
  overrideAllTags: (tag) => dispatch(shapesTagsOverrideAction(tag)),
  setActiveShape: (shape) => dispatch(setActiveShapeAction(shape)),
  changeShapeTag: (tag) => dispatch(changeActiveShapeTagAction(tag)),
  changeShapeMetric: (metric) => dispatch(changeMetricsAction(metric)),
  deleteShape: () => dispatch(deleteShapeAction()),
  resetShapesTags: () => dispatch(resetShapesTagsAction()),
});

export default connect<StateProps, DispatchProps, {}, RootState>(mapState, mapDispatch)(SimilarShapes);
