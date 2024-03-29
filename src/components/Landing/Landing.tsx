import React from 'react';
import { connect } from 'react-redux';
import { fetchProjects } from 'src/model/actions/landing';
import { getSelectedExperiment } from 'src/model/selectors/projects';
import { RootState } from 'src/model/types';
import { getProcessedDataRuns } from 'src/model/selectors/experiment';
import Projects from './Projects';
import Pipelines from './Pipelines';
import Experiments from './Experiments';

import './Landing.scss';

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;
type Props = StateProps & DispatchProps;

class Landing extends React.Component<Props> {
  componentDidMount() {
    this.props.fetchProjectsList();
  }

  render() {
    return (
      <div className="page-landing">
        <Projects />
        <Pipelines />
        <Experiments />
      </div>
    );
  }
}

const mapState = (state: RootState) => ({
  isExperimentSelected: getSelectedExperiment(state),
  processedDataruns: getProcessedDataRuns(state),
});

const mapDispatch = (dispatch: Function) => ({
  fetchProjectsList: () => dispatch(fetchProjects()),
});

export default connect<StateProps, DispatchProps, {}, RootState>(mapState, mapDispatch)(Landing);
