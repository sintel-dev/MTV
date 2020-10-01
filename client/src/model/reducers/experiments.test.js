import experimentsReducer from './experiments';
import { experiments } from '../../tests/testmocks/experiments';

const initialState = {
  isExperimentsLoading: true,
  experimentsList: [],
  selectedExperimentID: null,
  isExperimentDataLoading: true,
  experimentDetails: [],
};
describe('Testing experiments reducer', () => {
  it('Should handle FETCH_EXPERIMENTS_REQUEST', () => {
    expect(
      experimentsReducer(undefined, {
        type: 'FETCH_EXPERIMENTS_REQUEST',
      }),
    ).toEqual(initialState);
  });

  it('Should handle FETCH_EXPERIMENTS_SUCCESS', () => {
    const successAction = {
      type: 'FETCH_EXPERIMENTS_SUCCESS',
      result: { experiments },
    };

    expect(experimentsReducer(undefined, successAction)).toEqual({
      isExperimentsLoading: false,
      experimentsList: experiments,
      experimentDetails: [],
      selectedExperimentID: null,
      isExperimentDataLoading: true,
    });
  });

  it('Should handle FETCH_EXPERIMENTS_FAILURE', () => {
    const errAction = {
      type: 'FETCH_EXPERIMENTS_FAILURE',
      experimentsList: [],
    };
    expect(experimentsReducer(undefined, errAction)).toEqual({
      isExperimentsLoading: false,
      experimentsList: [],
      experimentDetails: [],
      isExperimentDataLoading: true,
      selectedExperimentID: null,
    });
  });
});
