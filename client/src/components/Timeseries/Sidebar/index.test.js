import React from 'react';
import { Sidebar } from './index';
import * as sidebarUtils from './SidebarUtils';
import { dataRun } from '../../../tests/testmocks/dataRun';

jest.mock('./Header', () => () => 'Header component');

describe('Sidebar Unit tests -> ', () => {
  beforeAll(() => {
    sidebarUtils.getWrapperSize = jest.fn().mockReturnValue({ witdth: 200, height: 200 });
  });
  const sidebarProps = {
    dataRun,
    experimentData: {
      isExperimentDataLoading: false,
    },
  };

  it('Should Render without crashing', () => {
    const sidebar = shallow(<Sidebar {...sidebarProps} />);
    expect(sidebar).toMatchSnapshot();
  });
});
