import React from 'react';
import { connect } from 'react-redux';
import { fetchProjects } from '../../model/actions/landing';
import Projects from './Projects';
import Pipelines from './Pipelines';
import Experiments from './Experiments';

import { getSelectedExperiment } from '../../model/selectors/projects';
import { RootState } from '../../model/types';
import './Landing.scss';
import { getProcessedDataRuns } from '../../model/selectors/experiment';

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
        <p style={{ fontSize: '20px' }}>You have logged in successfully!</p>

        <p style={{ fontSize: '20px' }}>
          Please close this web tab (<u>DO NOT</u> log out), go back to the userstudy page, and follow the instructions
          to proceed.
        </p>
        <Projects />
        <Pipelines />
        <Experiments />
        {/* <Projects />
        <Pipelines />
        <Experiments /> */}
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
