import React from 'react';
import { Header } from './Header';
import { dataRun } from '../../../tests/testmocks/dataRun';

jest.mock('./EventSummary', () => () => 'Event Summary component');

describe('Testing Sidebar header component', () => {
  const headerProps = {
    dataRun,
    selectedPeriodLevel: {},
  };

  it('Should render without crashing', () => {
    const header = shallow(<Header {...headerProps} />);
    expect(header).toMatchSnapshot();
  });
});
