import React from 'react';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsAlt } from '@fortawesome/free-solid-svg-icons';
import { RootState } from 'src/model/types';
import { getZoomMode, getIsEditingEventRange } from '../../../model/selectors/datarun';
import { zoomOnClick, zoomToggleAction } from '../../../model/actions/datarun';

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;
type ZoomControlsProps = StateProps & DispatchProps;

export const ZoomControls: React.FC<ZoomControlsProps> = (props) => (
  <div>
    <ul>
      <li>
        <label htmlFor="zoomMode">
          <FontAwesomeIcon icon={faArrowsAlt} />
          <input
            type="checkbox"
            name="zoomMode"
            id="zoomMode"
            checked={props.isZoomEnabled}
            onChange={(event) => !props.isEditingEventRange && props.zoomToggle(event.target.checked)}
          />
        </label>
      </li>
      <li>
        <button type="button" onClick={() => props.zoom('In')} disabled={props.isEditingEventRange} id="zoomIn">
          <span>+</span>
        </button>
      </li>
      <li>
        <button type="button" onClick={() => props.zoom('Out')} disabled={props.isEditingEventRange} id="zoomOut">
          <span>-</span>
        </button>
      </li>
    </ul>
  </div>
);

const mapState = (state: RootState) => ({
  isZoomEnabled: getZoomMode(state),
  isEditingEventRange: getIsEditingEventRange(state),
});

const mapDispatch = (dispatch: Function) => ({
  zoom: (direction) => dispatch(zoomOnClick(direction)),
  zoomToggle: (mode) => dispatch(zoomToggleAction(mode)),
});

export default connect<StateProps, DispatchProps, {}, RootState>(mapState, mapDispatch)(ZoomControls);
