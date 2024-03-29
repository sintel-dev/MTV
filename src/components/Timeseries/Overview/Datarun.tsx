import React from 'react';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGripLinesVertical } from '@fortawesome/free-solid-svg-icons';
import { selectDatarun } from 'src/model/actions/datarun';
import { getSelectedDatarunID } from 'src/model/selectors/datarun';
import { getIsEditingEventRange } from 'src/model/selectors/events';
import { RootState, DatarunDataType } from 'src/model/types';

import DrawChart from './DrawChart';

type OwnProps = {
  datarun: DatarunDataType;
};

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;
type Props = StateProps & DispatchProps & OwnProps;

export const Datarun: React.FC<Props> = ({ datarun, onSelectDatarun, selectedDatarunID, isEditingEventRange }) => {
  const activeClass = datarun.id === selectedDatarunID ? 'active' : '';
  return (
    <div className={`time-row ${activeClass}`} onClick={() => !isEditingEventRange && onSelectDatarun(datarun.id)}>
      <ul>
        <li className="grip">
          <FontAwesomeIcon className="fa-grip" icon={faGripLinesVertical} />
          {datarun.signal}
        </li>
        <li>
          <DrawChart dataRun={datarun} />
        </li>
      </ul>
    </div>
  );
};

const mapState = (state: RootState) => ({
  selectedDatarunID: getSelectedDatarunID(state),
  isEditingEventRange: getIsEditingEventRange(state),
});

const mapDispatch = (dispatch: Function) => ({
  onSelectDatarun: (datarunID: string) => dispatch(selectDatarun(datarunID)),
});

export default connect<StateProps, DispatchProps, OwnProps, RootState>(mapState, mapDispatch)(Datarun);
