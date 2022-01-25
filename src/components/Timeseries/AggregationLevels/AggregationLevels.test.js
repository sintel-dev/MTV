import React from 'react';
import { TestWrapper, renderWithStore } from 'src/tests/utils';
import { AggregationLevels } from './AggregationLevels';

describe('Testing Aggregation levels component', () => {
  const aggregationProps = {
    currentAggregationLevel: {
      selectedLevel: '30 hours',
      timeInMiliseconds: 108000000,
    },
    currentEventDetails: {
      tag: 'Untagged',
    },
    width: 200,
    height: 700,
    signalRawData: [
      [1536451200000, 1945.5399780273438],
      [1536559200000, 1987.1500244140625],
      [1536667200000, 1990],
      [1536775200000, 1989.8699951171875],
      [1536883200000, 1970.18994140625],
      [1536991200000, 1970.18994140625],
      [1537099200000, 1908.030029296875],
      [1537207200000, 1941.050048828125],
    ],
    zoomValue: 1,
    currentChartStyle: 'linear',
    eventInterval: [
      [1550966400000, 173.5999984741211],
      [1551074400000, 174.3300018310547],
      [1551182400000, 174.8699951171875],
      [1551290400000, 173.14999389648438],
      [1551398400000, 174.97000122070312],
      [1551506400000, 174.97000122070312],
      [1551614400000, 175.85000610351562],
      [1551722400000, 175.52999877929688],
      [1551830400000, 173.51000213623047],
      [1551938400000, 172.91000366210938],
    ],
  };
  const AggregationComponent = renderWithStore(
    {},
    <TestWrapper>
      <AggregationLevels {...aggregationProps} />
    </TestWrapper>,
  );

  it('Should render without crashing', () => {
    expect(AggregationComponent).toMatchSnapshot();
  });
});
