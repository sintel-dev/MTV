import React from 'react';
import { connect } from 'react-redux';
import { fetchProjects } from '../../model/actions/landing';
import Select from 'react-select';
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
type State = {
  selectedDataset: {name: string};
}

class Landing extends React.Component<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      selectedDataset: null
    };
  }

  componentDidMount() {
    this.props.fetchProjectsList();
  }

  componentDidUpdate(prevProp, prevState) {
    // console.log('update', this.state, prevState);
  }
  
  private datasetLabelFormat = ({name}) => (
    <div className="select-row">
      <label className="select">{name}</label>
    </div>
  );

  private datasetOptions = [
    { name: 'Investigate'},
    { name: 'Do not Investigate'},
    { name: 'Postpone'}
  ]

  onDatasetChange = (option) => {
    this.setState({
      selectedDataset: option
    })
  }

  selectDataset(option) {
    if (!option) {
      return 'Select a dataset';
    } else {
      return option;
    }
  } 

  render() {

    return (
      <div className="page-landing">
        {/* <div className="dashboard">
          <div className="row">
            Datasets:
            <Select
              onChange={(option) => { this.onDatasetChange(option); }}
              formatOptionLabel={this.datasetLabelFormat}
              options={this.datasetOptions}
              className="dataset-select"
              classNamePrefix="dataset-options"
              placeholder="Select a dataset"
              value={this.selectDataset(this.state.selectedDataset)}
            />
          </div>
          <hr/>
        </div> */}
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
