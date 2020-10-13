import React, { Component, ReactNode } from 'react';
import { connect } from 'react-redux';
import { toggleRelativeScaleAction } from 'src/model/actions/sidebar';
import { getIsRelativeScaleEnabled } from 'src/model/selectors/sidebar';
import {
  getSelectedPeriodLevel,
  getIsEditingEventRange,
  getIsEventModeEnabled,
  getIsTimeSyncModeEnabled,
  getFilteredPeriodRange,
  getScrollHistory,
} from 'src/model/selectors/datarun';
import {
  toggleEventModeAction,
  setPeriodRangeAction,
  setScrollHistoryAction,
  setReviewPeriodAction,
} from 'src/model/actions/datarun';
import { RootState } from 'src/model/types';
import EventSummary from './EventSummary';

const showPeriod = (periodRange): ReactNode => {
  let periodString = (
    <p>
      <span>YY / MM</span>
    </p>
  );

  const { level } = periodRange;
  if (level === 'month') {
    periodString = (
      <p>
        <span className="active">{periodRange.parent.name}</span>
        <span> / MM</span>
      </p>
    );
  }

  if (level === 'day') {
    periodString = (
      <p>
        <span className="active">{periodRange.parent.parent.name}</span> /{' '}
        <span className="active">{periodRange.parent.name}</span>
      </p>
    );
  }

  return <div className="period-info">{periodString}</div>;
};

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;
type Props = StateProps & DispatchProps;

class Header extends Component<Props> {
  componentDidUpdate(prevProps: Props) {
    const { isTimeSyncEnabled, filteredPeriodRange, setScrollHistory, scrollHistory } = this.props;

    if (!isTimeSyncEnabled) {
      return;
    }

    if (prevProps.filteredPeriodRange[0].level !== filteredPeriodRange[0].level) {
      const { level } = filteredPeriodRange[0];
      let currentPeriod = scrollHistory;
      if (level === 'year') {
        currentPeriod = {
          ...currentPeriod,
          level: 'year',
        };
      }

      if (level === 'month') {
        const currentYear = currentPeriod.year;
        const newYear = filteredPeriodRange[0].parent.name;
        currentPeriod = {
          ...currentPeriod,
          year: currentYear !== newYear ? newYear : currentYear,
          level: 'month',
        };
      }

      if (level === 'day') {
        const currentMonth = currentPeriod.month;
        const newMonth = filteredPeriodRange[0].parent.name;
        const currentYear = currentPeriod.year;
        const newYear = filteredPeriodRange[0].parent.parent.name;
        currentPeriod = {
          ...currentPeriod,
          year: currentYear !== newYear ? newYear : currentYear,
          month: currentMonth !== newMonth ? newMonth : currentMonth,
          level: 'day',
        };
      }
      setScrollHistory(currentPeriod);
    }
  }

  private getBtnProps(button: string): { className: string; disabled: boolean; onClick: () => void } {
    const { setReviewPeriod, isEditingEventRange, currentPeriod, scrollHistory, isTimeSyncEnabled } = this.props;
    const getParentLevel = (): string => (button === 'day' ? 'month' : 'year');
    const getIsActive = (): string | boolean | null => {
      if (button === 'year') {
        return isTimeSyncEnabled ? scrollHistory.level === 'year' : currentPeriod.level === null;
      }
      return isTimeSyncEnabled
        ? scrollHistory.level === button
        : currentPeriod.level === getParentLevel() || currentPeriod.level === getParentLevel();
    };

    const getIsDisabled = (): boolean => {
      if (button === 'year') {
        return false;
      }
      return isTimeSyncEnabled ? scrollHistory[getParentLevel()] === null : currentPeriod[getParentLevel()] === null;
    };

    return {
      className: getIsActive() ? 'active' : '',
      disabled: getIsDisabled(),
      onClick: () =>
        !isEditingEventRange && button === 'year' ? setReviewPeriod(null) : setReviewPeriod(getParentLevel()),
    };
  }

  render() {
    const { filteredPeriodRange, isRelativeScaleEnabled, toggleRelativeScale } = this.props;

    return (
      <div className="period-control">
        <EventSummary />
        <div className="period-wrapper">
          <div className="sidechart-controls switch-control">
            <div className="row">
              <label htmlFor="glyphScale">
                <input
                  type="checkbox"
                  id="glyphScale"
                  onChange={toggleRelativeScale}
                  checked={isRelativeScaleEnabled}
                />
                <span className="switch" />
                Relative scale
              </label>
            </div>
          </div>
          {showPeriod(filteredPeriodRange[0])}
          <ul className="period-filter">
            <li>
              <button type="button" {...this.getBtnProps('year')}>
                Year
              </button>
            </li>
            <li>
              <button type="button" {...this.getBtnProps('month')}>
                Month
              </button>
            </li>
            <li>
              <button type="button" {...this.getBtnProps('day')}>
                Day
              </button>
            </li>
          </ul>
          {/* @TODO - new toggle switch appear(changeScale), check to see where to place this one */}
          {/* <ul>
            <li>
              <div className="switch-control reversed">
                <div className="row">
                  <label htmlFor="toggleEvents">
                    Show Events
                    <input
                      type="checkbox"
                      id="toggleEvents"
                      onChange={(event) => toggleEventsMode(event.target.checked)}
                      checked={isEventModeEnabled}
                    />
                    <span className="switch" />
                  </label>
                </div>
              </div>
            </li>
          </ul> */}
        </div>
        <div className="clear" />
      </div>
    );
  }
}

const mapState = (state: RootState) => ({
  isEditingEventRange: getIsEditingEventRange(state),
  isEventModeEnabled: getIsEventModeEnabled(state),
  isTimeSyncEnabled: getIsTimeSyncModeEnabled(state),
  filteredPeriodRange: getFilteredPeriodRange(state),
  currentPeriod: getSelectedPeriodLevel(state),
  scrollHistory: getScrollHistory(state),
  isRelativeScaleEnabled: getIsRelativeScaleEnabled(state),
});

const mapDispatch = (dispatch: Function) => ({
  setPeriodRange: (periodRange) => dispatch(setPeriodRangeAction(periodRange)),
  toggleEventsMode: (mode) => dispatch(toggleEventModeAction(mode)),
  setScrollHistory: (period) => dispatch(setScrollHistoryAction(period)),
  setReviewPeriod: (period) => dispatch(setReviewPeriodAction(period)),
  toggleRelativeScale: () => dispatch(toggleRelativeScaleAction()),
});

export default connect<StateProps, DispatchProps, {}, RootState>(mapState, mapDispatch)(Header);
