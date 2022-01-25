import React from 'react';
import { connect } from 'react-redux';
import * as _ from 'lodash';
import { withRouter, useHistory } from 'react-router-dom';
import { RootState, ExperimentDataType } from 'src/model/types';
import { selectExperiment } from 'src/model/actions/landing';
import {
  getFilteredExperiments,
  getIsExperimentsLoading,
  getSelectedPipeline,
  getSelectedExperiment,
} from 'src/model/selectors/projects';
import Loader from '../Common/Loader';
import { TagStats, MatrixScale } from './Matrix/types';
import { fromTagToID } from './utils';
import Matrix from './Matrix/Matrix';

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;
type Props = StateProps & DispatchProps;

let props: Props;
type ExperimentProps = {
  experiment: ExperimentDataType;
  tagStats: TagStats;
  matrixScale: MatrixScale;
  index: number;
  selectedPipeline: typeof props.selectedPipeline;
  selectedExperiment: typeof props.selectedExperiment;
};

const countDatarunEvents = (experiment) => {
  const { dataruns } = experiment;
  return dataruns.map((datarun) => datarun.events.length).reduce((item, accumulator) => item + accumulator, 0);
};

export const Experiment: React.FC<ExperimentProps> = ({
  experiment,
  tagStats,
  matrixScale,
  index,
  selectedPipeline,
  selectedExperiment,
}: ExperimentProps) => {
  let history = useHistory();
  const activeClass = selectedPipeline || selectedExperiment === experiment.id ? 'active' : '';
  const eventCounts = countDatarunEvents(experiment);
  const { id, dataruns, name, date_creation, created_by } = experiment;

  return (
    <div className={`cell ${activeClass}`} key={index} onClick={() => history.push(`/experiment/${id}`)}>
      <h3>
        #{index + 1} {name}
      </h3>
      <div className="item-data">
        <ul>
          <li>Signals: {dataruns.length}</li>
          <li>Events: {eventCounts}</li>
          <li>DC: {date_creation.substring(0, 10)}</li>
          <li>By: {`${created_by}`}</li>
        </ul>
        <Matrix experiment={experiment} tagStats={tagStats} scale={matrixScale} />
      </div>
    </div>
  );
};

export const Experiments: React.FC<Props> = ({
  isExperimentsLoading,
  filteredExperiments,
  onSelectExperiment,
  selectedPipeline,
  selectedExperiment,
}: Props) => {
  // Compute maxTagNum, maxEventNum, and maxScore
  // which would be used for plotting Matrix
  let maxTagNum: number = Number.MIN_SAFE_INTEGER;
  let maxEventNum: number = Number.MIN_SAFE_INTEGER;
  let maxScore: number = Number.MIN_SAFE_INTEGER;
  let tagStatsList: TagStats[] = [];

  filteredExperiments.forEach((currentExperiment) => {
    const { dataruns } = currentExperiment;
    let tagStats: { [index: string]: number } = {};

    for (let i = 0; i < 7; i += 1) {
      tagStats[String(i)] = 0;
    }

    dataruns.forEach((currentDatarun) => {
      const { events } = currentDatarun;
      for (let iterator = 0; iterator < events.length; iterator += 1) {
        let tagID: string = fromTagToID(events[iterator].tag);

        tagID = tagID === 'untagged' ? '0' : tagID;
        if (!_.has(tagStats, tagID)) {
          tagStats[tagID] = 0;
        }

        tagStats[tagID] += 1;
        maxTagNum = maxTagNum < tagStats[tagID] ? tagStats[tagID] : maxTagNum;
        maxScore = maxScore > events[iterator].score ? maxScore : events[iterator].score;
        maxEventNum = maxEventNum < events.length ? events.length : maxEventNum;
      }
    });
    tagStatsList.push(tagStats);
  });

  const matrixScale: MatrixScale = {
    maxTagNum,
    maxEventNum,
    maxScore,
  };

  return (
    <div className="item-row scroll-style" id="experiments" data-name="experiments">
      <h2>Experiments</h2>
      <div className="item-wrapper">
        <Loader isLoading={isExperimentsLoading}>
          {filteredExperiments.length ? (
            filteredExperiments.map((experiment, index) => {
              const experimentProps = {
                experiment,
                tagStats: tagStatsList[index],
                matrixScale,
                index,
                onSelectExperiment,
                selectedPipeline,
                selectedExperiment,
              };
              return <Experiment key={experiment.id} {...experimentProps} />;
            })
          ) : (
            <h2>No experiments found</h2>
          )}
        </Loader>
      </div>
    </div>
  );
};

const mapState = (state: RootState) => ({
  filteredExperiments: getFilteredExperiments(state),
  isExperimentsLoading: getIsExperimentsLoading(state),
  selectedPipeline: getSelectedPipeline(state),
  selectedExperiment: getSelectedExperiment(state),
});

const mapDispatch = (dispatch: Function) => ({
  onSelectExperiment: (history, experiment: string) => dispatch(selectExperiment(history, experiment)),
});

export default withRouter(connect<StateProps, DispatchProps, {}, RootState>(mapState, mapDispatch)(Experiments));
