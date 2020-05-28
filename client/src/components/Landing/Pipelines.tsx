import React from 'react';
import { connect } from 'react-redux';
import Loader from '../Common/Loader';
import { getPipelinesData, getSelectedPipeline, getExperimentsData } from '../../model/selectors/projects';
import { selectPipeline } from '../../model/actions/landing';
import { RootState, PipelineDataType } from '../../model/types';

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;
type Props = StateProps & DispatchProps;

const Pipelines: React.FC<Props> = props => {
  const { onSelectPipeline, selectedPipeline, pipelinesData, experimentsData } = props;
  const { pipelineList, isPipelinesLoading } = pipelinesData;

  return (
    <div className="item-row scroll-style" id="pipelines">
      <h2>Pipelines</h2>
      <div className="item-wrapper">
        <Loader isLoading={isPipelinesLoading}>
          {pipelineList.length ? (
            pipelineList.map((pipeline, index) =>
              renderPipeline({ pipeline, index, onSelectPipeline, selectedPipeline, experimentsData }),
            )
          ) : (
            <p>No pipelines have been found</p>
          )}
        </Loader>
      </div>
    </div>
  );
};

let props: Props;
type renderPipelineProps = {
  pipeline: PipelineDataType;
  index: number;
  onSelectPipeline: typeof props.onSelectPipeline;
  selectedPipeline: typeof props.selectedPipeline;
  experimentsData: typeof props.experimentsData
};

const renderPipeline: React.FC<renderPipelineProps> = ({ pipeline, index, onSelectPipeline, selectedPipeline, experimentsData }) => {
  const activeClass = selectedPipeline === pipeline.name ? 'active' : '';

  const eNum = experimentsData.experimentsList.filter((exp) => exp.pipeline === pipeline.name).length;
  return (
    <div className={`cell ${activeClass}`} key={index} onClick={() => onSelectPipeline(pipeline.name)}>
      <h3>{pipeline.name}</h3>
      <div className="item-data">
        <ul>
          <li>{pipeline.mlpipeline.primitives.length} primitives</li>
          <li>created on {pipeline.insert_time.substring(0, 10)}</li>
          <li>by {pipeline.created_by || 'null'}</li>
        </ul>
        <ul className="last">
          <li> {eNum} experiments</li>
        </ul>
      </div>
    </div>
  );
};

const mapState = (state: RootState) => ({
  pipelinesData: getPipelinesData(state),
  selectedPipeline: getSelectedPipeline(state),
  experimentsData: getExperimentsData(state)
});

const mapDispatch = (dispatch: Function) => ({
  onSelectPipeline: pipelineName => dispatch(selectPipeline(pipelineName)),
});

export default connect<StateProps, DispatchProps, {}, RootState>(mapState, mapDispatch)(Pipelines);
