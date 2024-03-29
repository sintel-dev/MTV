import API from '../utils/api';
import { getSelectedPipeline, getSelectedExperiment } from '../selectors/projects';
import {
  FETCH_DATASETS,
  FetchDatasetsAction,
  FETCH_EXPERIMENTS,
  FetchExperimentsAction,
  FETCH_PIPELINES,
  FetchPipelinesAction,
  FETCH_PROJECTS,
  FetchProjectsAction,
  SELECT_PROJECT,
  SelectProjectAction,
  SELECT_PIPELINE,
  SelectPipelineAction,
  SELECT_EXPERIMENT,
  SelectExperimentAction,
  FETCH_DATARUNS_BY_EXPERIMENT_ID,
  FecthDatarunsByExperimentIDAction,
  FETCH_EXPERIMENT_DATA,
  FetchExpActionType,
} from '../types';
import { getUsersDataAction } from './users';

export function fetchExperiments() {
  return function (dispatch) {
    const action: FetchExperimentsAction = {
      type: FETCH_EXPERIMENTS,
      promise: API.experiments.all(),
    };
    dispatch(action);
    return action.promise;
  };
}

export function fetchPipelines() {
  return function (dispatch) {
    const action: FetchPipelinesAction = {
      type: FETCH_PIPELINES,
      promise: API.pipelines.all(),
    };
    dispatch(action);
    return action.promise;
  };
}

export function fetchDatasets() {
  return function (dispatch) {
    const action: FetchDatasetsAction = {
      type: FETCH_DATASETS,
      promise: API.datasets.all(),
    };
    dispatch(action);
    return action.promise;
  };
}

export function fetchProjects() {
  return function (dispatch) {
    const action: FetchProjectsAction = {
      type: FETCH_PROJECTS,
      promise: Promise.all([dispatch(fetchExperiments()), dispatch(fetchPipelines()), dispatch(fetchDatasets())]),
    };
    dispatch(action);
    return action.promise;
  };
}

export function fetchDatarunsByExperimentID() {
  return function (dispatch, getState) {
    const experimentID: string = getSelectedExperiment(getState());
    const action: FecthDatarunsByExperimentIDAction = {
      type: FETCH_DATARUNS_BY_EXPERIMENT_ID,
      promise: API.dataruns.all({}, { experiment_id: experimentID }),
    };
    dispatch(action);
    return action.promise;
  };
}

export function selectProject(activeProject: string) {
  return function (dispatch) {
    const action: SelectProjectAction = {
      type: SELECT_PROJECT,
      activeProject,
    };
    dispatch(action);
  };
}

export function selectPipeline(selectedPipelineName: string | null) {
  return function (dispatch, getState) {
    const currentSelectedPipeline: string = getSelectedPipeline(getState());
    selectedPipelineName = selectedPipelineName !== currentSelectedPipeline ? selectedPipelineName : null;
    const action: SelectPipelineAction = {
      type: SELECT_PIPELINE,
      selectedPipelineName,
    };
    dispatch(action);
  };
}

export function fetchExperimentData(experimentID: string) {
  return function (dispatch) {
    const fetchExpAction: FetchExpActionType = {
      type: FETCH_EXPERIMENT_DATA,
      promise: API.experiments.find(`${experimentID}/`),
    };
    dispatch(fetchExpAction);
  };
}

export function selectExperiment(history: any, experimentID: string) {
  return function (dispatch) {
    const selectExpAction: SelectExperimentAction = {
      type: SELECT_EXPERIMENT,
      selectedExperimentID: experimentID,
    };

    dispatch(selectExpAction);
    dispatch(fetchExperimentData(experimentID));
    dispatch(getUsersDataAction());
    return dispatch(fetchDatarunsByExperimentID());
  };
}
