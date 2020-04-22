import pipelinesReducer from './pipelines';
import { pipelines } from '../../tests/testmocks/pipelines';

describe('Testing pipelines reducers', () => {
  it('Should handle GET_PIPELINES_REQUEST', () => {
    expect(
      pipelinesReducer(undefined, {
        type: 'GET_PIPELINES_REQUEST',
      }),
    ).toEqual({
      isPipelinesLoading: true,
      pipelineList: [],
      selectedPipelineName: null,
    });
  });

  it('Should handle GET_PIPELINES_SUCCESS', () => {
    const successAction = {
      type: 'GET_PIPELINES_SUCCESS',
      result: { pipelines },
    };
    expect(pipelinesReducer(undefined, successAction)).toEqual({
      isPipelinesLoading: false,
      pipelineList: pipelines,
      selectedPipelineName: null,
    });
  });

  it('Should handle GET_PIPELINES_FAILURE', () => {
    const errAction = {
      type: 'GET_PIPELINES_FAILURE',
      isPipelinesLoading: false,
      result: { pipelines },
    };

    expect(pipelinesReducer(undefined, errAction)).toEqual({
      isPipelinesLoading: false,
      pipelineList: [],
      selectedPipelineName: null,
    });
  });

  it('Should handle SELECT_PIPELINE', () => {
    const action = {
      type: 'SELECT_PIPELINE',
      selectedPipelineName: 'cyclegan',
      isPipelinesLoading: true,
      pipelineList: [],
    };

    expect(pipelinesReducer(undefined, action)).toEqual({
      selectedPipelineName: 'cyclegan',
      isPipelinesLoading: true,
      pipelineList: [],
    });
  });
});
