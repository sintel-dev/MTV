import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as fileDownload from 'react-file-download';
import { faChevronRight, faChevronLeft, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { getCurrentExperimentDetails, getSelectedExperimentData } from 'src/model/selectors/experiment';
import { toggleTimeSyncModeAction, switchChartStyleAction } from 'src/model/actions/datarun';
import { filterEventsByTagAction } from 'src/model/actions/events';
import { getIsTimeSyncModeEnabled, getDatarunDetails, getCurrentChartStyle } from 'src/model/selectors/datarun';
import { getActiveEventID } from 'src/model/selectors/events';
import { AUTH_USER_DATA } from 'src/model/utils/constants';
import { getSelectedExperiment } from 'src/model/selectors/projects';
import { onUserLogoutAction } from 'src/model/actions/users';
import { RootState } from 'src/model/types';
import { VerticalDots, DownloadIcon, UploadIcon, LineIcon, StepIcon, LogoutIcon } from '../Common/icons';
import Dropdown from '../Common/Dropdown';
import UploadEvents from '../Timeseries/UploadEvents';
import './header.scss';

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;

type UserData = {
  email: string;
  gid: string;
  name: string;
  picture: string;
};

type Props = StateProps & DispatchProps;

const downloadAsJSON = (dataRun) => {
  const { events, id } = dataRun;
  const jsonData = JSON.stringify(events);
  fileDownload(jsonData, `Datarun_${id}.json`);
};

export const Header: React.FC<Props> = (props) => {
  const switchClassName: string = props.selectedExperimentID ? 'active' : '';
  const {
    experimentDetails,
    isTimeSyncEnabled,
    filterByTags,
    toggleTimeSync,
    datarunDetails,
    experimentData,
    switchChartStyle,
    currentChartStyle,
    activeEvent,
  } = props;
  const { isExperimentDataLoading } = experimentData;
  let location = useLocation();
  const currentView: string = location.pathname;
  const linkTo: string = currentView === '/' ? `/experiment/${props.selectedExperimentID}` : '/';

  const logoutUser = (): void => {
    props.userLogout();
    window.location.href = '/';
  };

  const [isInfoOpen, toggleInfo] = useState(false);
  const [isOptsOpen, toggleOptsState] = useState(false);
  const [isUploadModalVisible, toggleUploadModalState] = useState(false);
  const activeClass: string = isInfoOpen ? 'active' : '';

  const dropDownProps = {
    isMulti: true,
    closeMenuOnSelect: false,
    placeholder: 'Filter',
    onChange: filterByTags,
    isDisabled: activeEvent !== null,
  };

  window.addEventListener('click', (evt: Event) => {
    if (currentView === '/') {
      return null;
    }
    const dropdown: Node = document.querySelector('.exp-info');
    dropdown && !dropdown.contains(evt.target as Node) && toggleInfo(false);

    const userOpts: Node = document.querySelector('.data-opts');
    userOpts && !userOpts.contains(evt.target as Node) && toggleOptsState(false);
    return null;
  });

  // @TODO - check the case of normal/non google login
  const userData: UserData = JSON.parse(Cookies.get(AUTH_USER_DATA));

  const { name, picture } = userData;

  return (
    <header id="header" className="main-header">
      <div className="header-container">
        <Link to="/" className="logo">
          <b>MTV</b>
        </Link>
        <Link to={linkTo} className={`page-switch-btn ${switchClassName}`}>
          <FontAwesomeIcon icon={currentView === '/' ? faChevronRight : faChevronLeft} />
        </Link>
        {currentView !== '/' && (
          <div className="header-left-wrapper">
            <div className="exp-info" onClick={() => toggleInfo(!isInfoOpen)}>
              <ul>
                <li className={activeClass}>
                  Details
                  <span>
                    <FontAwesomeIcon icon={faCaretDown} />
                  </span>
                  <ul>
                    <li>
                      <span>Pipeline:</span>
                      <span>{experimentDetails.pipeline}</span>
                    </li>
                    <li>
                      <span>Dataset:</span>
                      <span>{experimentDetails.dataset}</span>
                    </li>
                    <li>
                      <span>By:</span>
                      <span>{experimentDetails.created_by || 'Unknown'}</span>
                    </li>
                    <li>
                      <span>Project:</span>
                      <span>{experimentDetails.project}</span>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
            <ul className={`data-opts ${isOptsOpen ? 'active' : ''}`}>
              <li>
                <button
                  type="button"
                  className="toggle-data-ops"
                  onClick={() => toggleOptsState(!isOptsOpen)}
                  disabled={isExperimentDataLoading}
                >
                  <VerticalDots />
                </button>
                <ul>
                  <li onClick={() => toggleUploadModalState(true)}>
                    <UploadIcon />
                    Import .JSON File
                  </li>
                  <li onClick={() => downloadAsJSON(datarunDetails)}>
                    <DownloadIcon />
                    Save Events as .JSON File
                  </li>
                  <li className="view-options">
                    <span>Chart Style</span>
                    <div className="switch-control-wrapper">
                      <button
                        type="button"
                        className={currentChartStyle === 'linear' ? 'active' : ''}
                        onClick={() => switchChartStyle('linear')}
                      >
                        <LineIcon />
                        Line
                      </button>
                      <button
                        type="button"
                        className={currentChartStyle === 'step' ? 'active' : ''}
                        onClick={() => switchChartStyle('step')}
                      >
                        <StepIcon />
                        Step
                      </button>
                    </div>
                  </li>
                </ul>
              </li>
            </ul>
            <div className="tag-wrapper">
              <Dropdown {...dropDownProps} />
            </div>
          </div>
        )}

        <div className="header-right-wrapper">
          {currentView !== '/' && (
            <div className="switch-control reversed">
              <div className="row">
                <label htmlFor="toggleTimeSync">
                  Sync Time Ranges
                  <input
                    type="checkbox"
                    id="toggleTimeSync"
                    onChange={(event) => toggleTimeSync(event.target.checked)}
                    checked={isTimeSyncEnabled}
                  />
                  <span className="switch" />
                </label>
              </div>
            </div>
          )}
          <ul className="user-opts">
            <li>
              <img src={picture} referrerPolicy="no-referrer" alt={name} />
            </li>
            <li>{name}</li>
            <li>
              <button type="button" onClick={logoutUser} className="logout-button">
                <LogoutIcon />
              </button>
            </li>
          </ul>
          <div className="clear" />
        </div>
      </div>
      <UploadEvents
        isUploadModalVisible={isUploadModalVisible}
        toggleModalState={(modalState) => toggleUploadModalState(modalState)}
      />
    </header>
  );
};

const mapState = (state: RootState) => ({
  selectedExperimentID: getSelectedExperiment(state),
  experimentDetails: getCurrentExperimentDetails(state),
  isTimeSyncEnabled: getIsTimeSyncModeEnabled(state),
  datarunDetails: getDatarunDetails(state),
  experimentData: getSelectedExperimentData(state),
  currentChartStyle: getCurrentChartStyle(state),
  activeEvent: getActiveEventID(state),
});

const mapDispatch = (dispatch: Function) => ({
  userLogout: () => dispatch(onUserLogoutAction()),
  filterByTags: (tags) => dispatch(filterEventsByTagAction(tags)),
  toggleTimeSync: (mode) => dispatch(toggleTimeSyncModeAction(mode)),
  switchChartStyle: (style) => dispatch(switchChartStyleAction(style)),
});

export default connect<StateProps, DispatchProps, {}, RootState>(mapState, mapDispatch)(Header);
