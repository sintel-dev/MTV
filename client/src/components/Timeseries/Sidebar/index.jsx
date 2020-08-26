import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ArrowDown, ArrowUp } from 'src/components/Common/icons';
import { Collapse } from 'react-collapse';
import { setActivePanelAction } from 'src/model/actions/sidebar';
import { getCurrentActivePanel } from 'src/model/selectors/sidebar';
import { getSelectedExperimentData } from '../../../model/selectors/experiment';
import Loader from '../../Common/Loader';
import { getIsEditingEventRange } from '../../../model/selectors/datarun';
import PeriodicalView from './SidebarComponents/PeriodicalView/PeriodicalView';
import EventDetailsView from './SidebarComponents/EventDetailsView/EventDetailsView';
import SignalAnnotations from './SidebarComponents/SignalAnnotationsView/SignalAnnotations';
import SimilarShapes from './SidebarComponents/SimilarShapes/SimilarShapes';
import './Sidebar.scss';

const sidebarPanels = [
  {
    key: 'periodicalView',
    title: 'Periodical View',
    component: <PeriodicalView />,
  },
  {
    key: 'signalView',
    title: 'Signal Annotations',
    component: <SignalAnnotations />,
  },
  {
    key: 'eventView',
    title: 'Event Details',
    component: <EventDetailsView />,
  },
  {
    key: 'similarShapes',
    title: 'Similar Segments',
    component: <SimilarShapes />,
  },
];

class Sidebar extends Component {
  toggleActivePanel(newPanel) {
    const { activePanel, setActivePanel } = this.props;
    if (newPanel !== activePanel) {
      return setActivePanel(newPanel);
    }

    return setActivePanel(null);
  }

  render() {
    const { experimentData, activePanel } = this.props;

    return (
      <div className="right-sidebar">
        <Loader isLoading={experimentData.isExperimentDataLoading}>
          {sidebarPanels.map((currentPanel) => {
            const { title } = currentPanel;
            const isPanelOpen = activePanel === currentPanel.key;
            return (
              <div key={currentPanel.key} className={`collapsible-wrapper scroll-style ${isPanelOpen ? 'active' : ''}`}>
                <div className="collapsible-trigger" onClick={() => this.toggleActivePanel(currentPanel.key)}>
                  <ul>
                    <li>{title}</li>
                    <li>{isPanelOpen ? <ArrowUp /> : <ArrowDown />}</li>
                  </ul>
                </div>
                <div className="collapsible-content">
                  <Collapse isOpened={isPanelOpen}>{currentPanel.component}</Collapse>
                </div>
              </div>
            );
          })}
        </Loader>
      </div>
    );
  }
}

export default connect(
  (state) => ({
    experimentData: getSelectedExperimentData(state),
    isEditingEventRange: getIsEditingEventRange(state),
    activePanel: getCurrentActivePanel(state),
  }),
  (dispatch) => ({
    setActivePanel: (activePanel) => dispatch(setActivePanelAction(activePanel)),
  }),
)(Sidebar);
