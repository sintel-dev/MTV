import { getExperimentsData, getPipelinesData, getDatasets, getSelectedPipeline } from './projects';

describe('Testing Projects selectors', () => {
  const projectsState = {
    experiments: {
      isExperimentDataLoading: false,
      isExperimentsLoading: true,
      selectedExperimentID: 'someID',
      experimentsList: [],
      experimentDetails: {
        dataset: 'someDataset',
        date_creation: 'Date_Of_Creation',
        id: 'someId',
        name: 'tech1',
        pipeline: 'somePipeline',
        project: 'someProject',
        created_by: 'someAuthor',
      },
    },
    pipelines: {
      isPipelinesLoading: false,
      pipelineList: [
        {
          created_by: 'someUser',
          id: 'someId',
          insert_time: 'someDate',
          name: 'tadgan_stock_tpl',
        },
      ],
      selectedPipelineName: 'selected_pipeline_name',
      datasets: {
        dataSetsList: [
          {
            created_by: 'someUser',
            entity: 'STOCK',
            id: 'someId',
            insert_time: 'someDate',
            name: 'NASDAQ',
          },
        ],
      },
      selectedProject: 'selected_project_name',
    },
  };

  it('getExperimentsData()', () => {
    expect(getExperimentsData(projectsState)).toBe(projectsState.experiments);
  });
  it('getPipelinesData()', () => {
    expect(getPipelinesData(projectsState)).toBe(projectsState.pipelines);
  });

  it('getDatasets()', () => {
    expect(getDatasets(projectsState)).toEqual(projectsState.datasets);
  });

  it('getSelectedPipeline()', () => {
    expect(getSelectedPipeline(projectsState)).toBe('selected_pipeline_name');
  });
});
