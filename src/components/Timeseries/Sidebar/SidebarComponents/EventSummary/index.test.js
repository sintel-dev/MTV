import React from 'react';
import { grouppedEvents } from 'src/tests/testmocks/grouppedEvents';
import EventSummary from './index';

describe('Testing Event Summary component -> ', () => {
  const evtSummaryProps = {
    isSummaryVisible: true,
    selectedPeriodLevel: [],
    grouppedEvents,
    filteredPeriodRange: [{ level: 'year', name: 2015 }],
  };

  it('Should render without crashing', () => {
    const evtSummaryComponent = shallow(<EventSummary {...evtSummaryProps} />);
    expect(evtSummaryComponent).toMatchSnapshot();
  });

  it('Should handle mouse over on column', () => {
    const spy = jest.spyOn(EventSummary.prototype, 'handleColHover');
    const evtSummaryComponent = mount(<EventSummary {...evtSummaryProps} />);
    const tableRow = evtSummaryComponent.find('.summary-details td').first();
    tableRow.simulate('mouseover');

    expect(spy).toBeCalledTimes(1);
  });
});
