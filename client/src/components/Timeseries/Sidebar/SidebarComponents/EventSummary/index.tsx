import React, { Component } from 'react';
import * as _ from 'lodash';
import { RootState } from 'src/model/types';
import {
  getDatarunDetails,
  getFilteredPeriodRange,
  getGrouppedDatarunEvents,
  getIsTimeSyncModeEnabled,
  getSelectedPeriodLevel,
} from 'src/model/selectors/datarun';
import { fromMonthToIndex } from 'src/model/utils/Utils';
import { connect } from 'react-redux';
import { tagSeq, fromTagToClassName } from '../../../../Landing/utils';

import './EventSummary.scss';

const renderTagIcon = () =>
  tagSeq.map((currentTag) => (
    <td key={currentTag}>
      <span className="tooltip-data">
        <i key={fromTagToClassName(currentTag)} className={`indicator ${fromTagToClassName(currentTag)}`} />
        {currentTag}
      </span>
      <i key={fromTagToClassName(currentTag)} className={`indicator ${fromTagToClassName(currentTag)}`} />
    </td>
  ));

const countEventsPerTag = (filterTag: string, events: object): number => {
  const currentEvents = Object.values(events);
  return currentEvents.filter((currentEvent) => currentEvent.tag === filterTag).length;
};

const renderTagEventsAll = (grouppedEvents) => {
  if (grouppedEvents === undefined) {
    return tagSeq.map((currentTag) => <td key={currentTag}>-</td>);
  }
  return tagSeq.map((currentTag) => {
    let eventSum = 0;
    let eventSet = new Set();
    _.each(grouppedEvents, (value) => {
      _.each(value.events, (event, eventId) => {
        if (event.tag === currentTag) {
          eventSet.add(eventId);
        }
      });
    });
    eventSum = eventSet.size;
    return <td key={currentTag}>{eventSum}</td>;
  });
};

const renderTagEventsPerYear = (periodRange, grouppedEvents) => {
  if (periodRange.level === 'year' || grouppedEvents === undefined) {
    return tagSeq.map((currentTag) => <td key={currentTag}>-</td>);
  }
  return tagSeq.map((currentTag) => <td key={currentTag}>{countEventsPerTag(currentTag, grouppedEvents.events)}</td>);
};

const renderTagEventsPerMonth = (periodRange, month, monthEvents) => {
  if (periodRange.level !== 'day' || monthEvents === undefined) {
    return tagSeq.map((currentTag) => <td key={currentTag}>-</td>);
  }
  const currentMonthEvents = monthEvents.months[fromMonthToIndex(month)];
  if (currentMonthEvents) {
    return tagSeq.map((currentTag) => (
      <td key={currentTag}>{countEventsPerTag(currentTag, currentMonthEvents.events)}</td>
    ));
  }
  return tagSeq.map((currentTag) => <td key={currentTag}>0</td>);
};

type StateProps = ReturnType<typeof mapState>;

class EventSummary extends Component<StateProps> {
  componentDidMount() {
    this.handleColHover();
  }

  handleColHover() {
    const td: NodeList = document.querySelectorAll('.summary-details td');

    td.forEach((currentTd) => {
      currentTd.addEventListener('mouseover', function () {
        const index: number = this.cellIndex + 1;
        document.querySelectorAll(`td:nth-child(${index})`).forEach((hoveredTd) => {
          hoveredTd.classList.add('highlighted');
        });
      });

      currentTd.addEventListener('mouseleave', function () {
        const index: number = this.cellIndex + 1;
        document.querySelectorAll(`td:nth-child(${index})`).forEach((hoveredTd) => {
          hoveredTd.classList.remove('highlighted');
        });
      });
    });
  }

  getTimeRangeEvents() {
    const { grouppedEvents, filteredPeriodRange } = this.props;
    const { level } = filteredPeriodRange[0];

    let eventsPerRange: object = {
      perYear: null,
      perMonth: null,
    };

    if (level === 'month') {
      const year = filteredPeriodRange[0].parent.name;
      if (grouppedEvents[year]) {
        eventsPerRange = {
          perYear: grouppedEvents[year].events,
        };
      }
    }

    if (level === 'day') {
      const year = filteredPeriodRange[0].parent.parent.name;
      const month = filteredPeriodRange[0].parent.name;

      if (grouppedEvents[year]) {
        eventsPerRange = {
          perYear: grouppedEvents[year].events,
          perMonth:
            (grouppedEvents[year].months &&
              grouppedEvents[year].months[fromMonthToIndex(month)] &&
              grouppedEvents[year].months[fromMonthToIndex(month)].events) ||
            null,
        };
      }
    }

    return eventsPerRange;
  }

  render() {
    const { filteredPeriodRange, grouppedEvents } = this.props;

    let currentYear = '';
    let currentMonth = '';
    let currentYearStr = '';
    let currentMonthStr = '';

    let periodRange = filteredPeriodRange[0];
    const { level } = periodRange;
    if (level === 'month') {
      currentYear = periodRange.parent.name;
      currentYearStr = `- ${periodRange.parent.name}`;
    } else if (level === 'day') {
      currentYear = periodRange.parent.parent.name;
      currentYearStr = `- ${periodRange.parent.parent.name}`;
      currentMonth = periodRange.parent.name;
      currentMonthStr = `- ${periodRange.parent.name}`;
    }

    return (
      <div className="event-summary">
        <div className="summary-details">
          <table>
            <tbody>
              <tr>
                <th>event tag</th>
                {renderTagIcon()}
              </tr>
              <tr>
                <th>All</th>
                {renderTagEventsAll(grouppedEvents)}
              </tr>
              <tr>
                <th>Year {currentYearStr} </th>
                {renderTagEventsPerYear(filteredPeriodRange[0], grouppedEvents[currentYear])}
              </tr>
              <tr>
                <th>Month {currentMonthStr}</th>
                {renderTagEventsPerMonth(filteredPeriodRange[0], currentMonth, grouppedEvents[currentYear])}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

const mapState = (state: RootState) => ({
  selectedPeriodLevel: getSelectedPeriodLevel(state),
  grouppedEvents: getGrouppedDatarunEvents(state),
  filteredPeriodRange: getFilteredPeriodRange(state),
  dataRun: getDatarunDetails(state),
  isTimeSyncEnabled: getIsTimeSyncModeEnabled(state),
});

export default connect<StateProps, {}, {}, RootState>(mapState)(EventSummary);
