import React from 'react';
import { connect } from 'react-redux';
import { getPipelinesData, getSelectedPipeline } from 'src/model/selectors/projects';
import { selectPipeline } from 'src/model/actions/landing';
import { RootState, PipelineDataType } from 'src/model/types';
import Loader from '../Common/Loader';

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;
type Props = StateProps & DispatchProps;

const Pipelines: React.FC<Props> = (props) => {
  const { onSelectPipeline, selectedPipeline, pipelinesData } = props;
  const { pipelineList, isPipelinesLoading } = pipelinesData;

  return (
    <div className="item-row scroll-style" id="pipelines">
      <h2>Pipelines</h2>
      <div className="item-wrapper">
        <Loader isLoading={isPipelinesLoading}>
          {pipelineList.length ? (
            pipelineList.map((pipeline, index) =>
              RenderPipeline({ pipeline, index, onSelectPipeline, selectedPipeline }),
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
type PipelineProps = {
  pipeline: PipelineDataType;
  index: number;
  onSelectPipeline: typeof props.onSelectPipeline;
  selectedPipeline: typeof props.selectedPipeline;
};

export const RenderPipeline: React.FC<PipelineProps> = ({
  pipeline,
  index,
  onSelectPipeline,
  selectedPipeline,
}: PipelineProps) => {
  const activeClass: string = selectedPipeline === pipeline.name ? 'active' : '';
  const { name, insert_time, created_by } = pipeline;

  return (
    <div className={`cell ${activeClass}`} key={index} onClick={() => onSelectPipeline(name)}>
      <h3>{name}</h3>
      <div className="item-data">
        <ul>
          <li>DC: {insert_time.substring(0, 10)}</li>
          <li>By: {created_by || 'null'}</li>
        </ul>
      </div>
    </div>
  );
};

const mapState = (state: RootState) => ({
  pipelinesData: getPipelinesData(state),
  selectedPipeline: getSelectedPipeline(state),
});

const mapDispatch = (dispatch: Function) => ({
  onSelectPipeline: (pipelineName: string) => dispatch(selectPipeline(pipelineName)),
});

export default connect<StateProps, DispatchProps, {}, RootState>(mapState, mapDispatch)(Pipelines);
