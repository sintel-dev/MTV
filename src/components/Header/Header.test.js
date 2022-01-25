import React from 'react';
import { TestWrapper, renderWithStore } from '../../tests/utils';
import { Header } from './Header';

jest.mock('js-cookie', () => ({
  get: (key) =>
    ({
      AUTH_USER_DATA: '{"name": "someName", "picture": "somePicture"}',
    }[key]),
}));

describe('Should render header', () => {
  const headerProps = {
    selectedExperimentID: '5da7cc6376e3e19307d0db64',
    experimentDetails: {
      created_by: 'dyu',
      dataruns: {
        id: '5f5b0df4013e4f912fba33e2',
        signal: '^IXIC',
      },
      dataset: 'NASDAQ',
      date_creation: '2020-09-11T05:41:08.221000',
      id: '5f5b0df4013e4f912fba33e0',
      name: 'tech2',
      pipeline: 'tadgan_stock_tpl',
      project: 'stock',
    },
    isTimeSyncEnabled: true,
    experimentData: {
      isExperimentDataLoading: false,
    },
  };

  const header = renderWithStore(
    {},
    <TestWrapper>
      <Header {...headerProps} />
    </TestWrapper>,
  );

  it('Renders <Header /> with enzyme', () => {
    expect(header).toMatchSnapshot();
  });
});
