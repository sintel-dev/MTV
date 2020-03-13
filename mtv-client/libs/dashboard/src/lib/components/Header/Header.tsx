import React from 'react';
import './header.scss';
import { connect } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { getSelectedExperiment } from '../../model/selectors/projects';
import { RootState } from '../../model/types';

const mapState = (state: RootState) => ({
  selectedExperimentID: getSelectedExperiment(state),
});

type StateProps = ReturnType<typeof mapState>;
type Props = StateProps;

const Header: React.FC<Props> = props => {
  const isSwitchVisible = props.selectedExperimentID ? 'active' : '';
  let history = useHistory();
  const currentView = history.location.pathname;
  const linkTo = currentView === '/' ? `/experiment/${props.selectedExperimentID}` : '/';
  return (
    <header id="header" className="main-header">
      <div className="header-container">
        <Link to="/" className="logo">
          <b>MTV</b>
        </Link>
        <Link to={linkTo} className={`page-switch-btn ${isSwitchVisible}`}>
          <FontAwesomeIcon icon={currentView === '/' ? faChevronRight : faChevronLeft} />
        </Link>
        <ul className="user-opts">
          <li>
            <Link to="/logout">Logout</Link>
          </li>
        </ul>
      </div>
    </header>
  );
};

export default connect<StateProps, {}, {}, RootState>(mapState)(Header);