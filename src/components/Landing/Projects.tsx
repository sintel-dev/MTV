import React from 'react';
import { connect } from 'react-redux';
import { getProjectsList, getIsProjectsLoading, getSelectedProjectName } from 'src/model/selectors/projects';
import { selectProject } from 'src/model/actions/landing';
import { RootState } from 'src/model/types';
import Loader from '../Common/Loader';

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;
type Props = StateProps & DispatchProps;

const Projects: React.FC<Props> = ({ projects, isProjectsLoading, onSelectProject, selectedProjectName }: Props) => (
  <div className="item-row scroll-style" id="projects">
    <h2>Datasets</h2>
    <div className="item-wrapper">
      <Loader isLoading={isProjectsLoading}>
        {projects && projects.length ? (
          projects.map((project, index) => RenderProject({ project, index, onSelectProject, selectedProjectName }))
        ) : (
          <p>No datasets have been found</p>
        )}
      </Loader>
    </div>
  </div>
);

let props: Props;
type ProjectProps = {
  project: any;
  index: number;
  onSelectProject: typeof props.onSelectProject;
  selectedProjectName: typeof props.selectedProjectName;
};

export const RenderProject: React.FC<ProjectProps> = ({
  project,
  index,
  onSelectProject,
  selectedProjectName,
}: ProjectProps) => {
  const activeClass = project.name === selectedProjectName ? 'active' : '';
  const { name, signalNum, uniquePipelineNum, experimentNum } = project;
  return (
    <div className={`cell ${activeClass}`} key={index} onClick={() => onSelectProject(name)}>
      <h3>{name}</h3>
      <div className="item-data">
        <ul>
          <li>{signalNum} Signals</li>
          <li>{uniquePipelineNum} unique pipelines</li>
        </ul>
        <ul className="last">
          <li>{experimentNum} experiments</li>
        </ul>
      </div>
    </div>
  );
};

const mapState = (state: RootState) => ({
  projects: getProjectsList(state),
  isProjectsLoading: getIsProjectsLoading(state),
  selectedProjectName: getSelectedProjectName(state),
});

const mapDispatch = (dispatch: Function) => ({
  onSelectProject: (projectName: string) => dispatch(selectProject(projectName)),
});

export default connect<StateProps, DispatchProps, {}, RootState>(mapState, mapDispatch)(Projects);
