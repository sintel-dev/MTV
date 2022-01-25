import React, { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { ArrowDown, ArrowUp } from 'src/components/Common/icons';
import { Collapse } from 'react-collapse';
import { setActivePanelAction } from 'src/model/actions/sidebar';
import { getCurrentActivePanel } from 'src/model/selectors/sidebar';
import { RootState } from 'src/model/types';
import { getSelectedExperimentData } from 'src/model/selectors/experiment';
import { getSelectedDatarun } from 'src/model/selectors/datarun';
import { getIsEditingEventRange } from 'src/model/selectors/events';
import Loader from '../../Common/Loader';
import PeriodicalView from './SidebarComponents/PeriodicalView/PeriodicalView';
import EventDetailsView from './SidebarComponents/EventDetailsView/EventDetailsView';
import SignalAnnotations from './SidebarComponents/SignalAnnotationsView/SignalAnnotations';
import SimilarShapes from './SidebarComponents/SimilarShapes/SimilarShapes';
import './Sidebar.scss';

type SidebarPanels = {
  key: string;
  title: string;
  component: ReactNode;
}[];

const sidebarPanels: SidebarPanels = [
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

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;
type Props = StateProps & DispatchProps;

class Sidebar extends Component<Props> {
  private toggleActivePanel(newPanel: string): void {
    const { activePanel, setActivePanel } = this.props;
    if (newPanel !== activePanel) {
      return setActivePanel(newPanel);
    }

    return setActivePanel(null);
  }

  render() {
    const { experimentData, activePanel, dataRun } = this.props;

    const events: Array<any> = (dataRun && dataRun.events) || [];

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
                    <li className="title">
                      <span>{title}</span>
                      {currentPanel.key === 'signalView' &&
                        (events.length ? <span>{events.length} events</span> : <span>No events</span>)}
                    </li>
                    <li>{isPanelOpen ? <ArrowUp /> : <ArrowDown />}</li>
                  </ul>
                </div>
                <div className={`collapsible-content ${currentPanel.key}`}>
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

const mapState = (state: RootState) => ({
  experimentData: getSelectedExperimentData(state),
  isEditingEventRange: getIsEditingEventRange(state),
  activePanel: getCurrentActivePanel(state),
  dataRun: getSelectedDatarun(state),
});

const mapDispatch = (dispatch: Function) => ({
  setActivePanel: (activePanel) => dispatch(setActivePanelAction(activePanel)),
});

export default connect<StateProps, DispatchProps, {}, RootState>(mapState, mapDispatch)(Sidebar);
