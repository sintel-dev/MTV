import {
  getIsAggregationModalOpen,
  getAggregationTimeLevel,
  getIsSigRawLoading,
  getCurrentSignalRawData,
  getContextInfoValue,
  getAggregationZoomValue,
} from './aggregationLevels';

describe('Aggregation levels selector', () => {
  const aggregationLevel = {
    aggregationLevels: {
      aggregationTimeLevel: {
        selectedLevel: '14 days',
        timeToSeconds: 1209600,
      },
      isSignalRawLoading: true,
      singalRawData: [
        [1421884800, 32.420000076293945],
        [1421992800, 32.59000015258789],
        [1422100800, 32.59000015258789],
        [1422208800, 32.779998779296875],
        [1422316800, 32.81999969482422],
      ],
      contextValue: 1,
      aggZoomValue: {
        k: 1,
        x: -80,
        y: -21,
      },
    },
  };
  describe('getIsAggregationModalOpen()', () => {
    it('Should return false for is aggregation isActive', () => {
      const initialState = {
        aggregationLevels: {
          isAggregationModalOpen: false,
        },
      };
      expect(getIsAggregationModalOpen(initialState)).toBe(false);
    });
    it('Should return true for aggregation isActive', () => {
      const initialState = {
        aggregationLevels: {
          isAggregationModalOpen: true,
        },
      };
      expect(getIsAggregationModalOpen(initialState)).toBe(true);
    });

    it('getAggregationTimeLevel()', () => {
      expect(getAggregationTimeLevel(aggregationLevel)).toEqual({
        selectedLevel: '14 days',
        timeToSeconds: 1209600,
      });
    });

    it('getIsSigRawLoading()', () => {
      expect(getIsSigRawLoading(aggregationLevel)).toBe(true);
    });

    it('getCurrentSignalRawData()', () => {
      expect(getCurrentSignalRawData(aggregationLevel)).toEqual([
        [1421884800, 32.420000076293945],
        [1421992800, 32.59000015258789],
        [1422100800, 32.59000015258789],
        [1422208800, 32.779998779296875],
        [1422316800, 32.81999969482422],
      ]);
    });

    it('getContextInfoValue()', () => {
      expect(getContextInfoValue(aggregationLevel)).toBe(1);
    });

    it('getAggregationZoomValue()', () => {
      expect(getAggregationZoomValue(aggregationLevel)).toEqual({
        k: 1,
        x: -80,
        y: -21,
      });
    });
  });
});
