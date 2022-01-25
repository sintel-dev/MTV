import { createSelector } from 'reselect';
import { RootState } from '../types';

export const getExperimentsData = (state: RootState) => state.experiments;
export const getPipelinesData = (state: RootState) => state.pipelines;
export const getDatasets = (state: RootState) => state.datasets;
export const getSelectedPipeline = (state: RootState) => state.pipelines.selectedPipelineName;
export const getSelectedProjectName = (state: RootState) => state.projects.selectedProject;
export const getIsExperimentsLoading = (state: RootState) => state.experiments.isExperimentsLoading;
export const getSelectedExperiment = (state: RootState) => state.experiments.selectedExperimentID;

export const getIsProjectsLoading = createSelector(
  [getExperimentsData, getPipelinesData, getDatasets],
  (experimentsData, pipelinesData, datasets) =>
    experimentsData.isExperimentsLoading || datasets.isDatasetLoading || pipelinesData.isPipelinesLoading,
);

const getSignalNum = (projectName: string) => {
  switch (projectName) {
    case 'SMAP':
      return 55;
    case 'MSL':
      return 27;
    default:
      // For SES
      return 71;
  }
};

export const getProjectsList = createSelector([getExperimentsData], (experimentsData) => {
  const groupedExperiments = experimentsData.experimentsList.reduce((result, experiment) => {
    if (!result[experiment.project]) {
      result[experiment.project] = [];
    }
    result[experiment.project].push(experiment);
    return result;
  }, {});

  return Object.keys(groupedExperiments).reduce(
    (projects, projectName) =>
      projects.concat({
        experimentNum: groupedExperiments[projectName].length,
        experiments: groupedExperiments[projectName],
        name: projectName,
        // @TODO - investigate if it's really needed
        // uniquePipelineNum: countPipelines(projectName),
        signalNum: getSignalNum(projectName),
      }),
    [],
  );
});

export const getFilteredExperiments = createSelector(
  [getSelectedProjectName, getExperimentsData, getSelectedPipeline],
  (selectedProjectName, experimentsData, selectedPipeline) =>
    experimentsData.experimentsList.filter((experiment) => {
      const isProjectMatch = !selectedProjectName || experiment.project === selectedProjectName;
      const isPipelineMatch = !selectedPipeline || experiment.pipeline === selectedPipeline;
      return isProjectMatch && isPipelineMatch;
    }),
);
