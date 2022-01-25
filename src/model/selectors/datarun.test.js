import {
  getActiveEventID,
  getUpdatedEventDetails,
  getNewEventDetails,
  isPredictionEnabled,
  isDatarunIDSelected,
  getSelectedPeriodRange,
  getIsEditingEventRange,
  getIsEditingEventRangeDone,
} from './datarun';

describe('Datarun unit tests', () => {
  const datarunState = {
    datarun: {
      activeEventID: 154778,
      eventDetails: {
        datarun: '5f5b0cbb013e4f912fba33ae',
        id: '5f5b0d4f013e4f912fba33c2',
        isCommentsLoading: false,
        score: 0.2250080582365125,
        signal: 'NXPI',
        signalrunID: '5f5b09ce013e4f912fba32cf',
        source: 'ORION',
        start_time: 1540598400000,
        stop_time: 1542067200000,
        tag: null,
      },
      newEventDetails: {
        datarun_id: '5f5b09cf013e4f912fba3300',
        score: 0,
        start_time: 1424822400000,
        stop_time: 1434499200000,
        tag: 'Untagged',
      },
      isPredictionEnabled: false,
      selectedDatarunID: '5f5b0cbb013e4f912fba33ae',
      selectedPeriodRange: {
        eventRange: [0, 0],
        timeStamp: [0, 0],
        zoomValue: 1,
      },
      isEditingEventRange: false,
      isEditingEventRangeDone: false,
    },
  };
  it('getActiveEventID', () => {
    expect(getActiveEventID(datarunState)).toBe(154778);
  });

  it('getUpdatedEventDetails()', () => {
    expect(getUpdatedEventDetails(datarunState)).toBe(datarunState.datarun.eventDetails);
  });
  it('getNewEventDetails()', () => {
    expect(getNewEventDetails(datarunState)).toBe(datarunState.datarun.newEventDetails);
  });
  it('isPredictionEnabled()', () => {
    expect(isPredictionEnabled(datarunState)).toBe(false);
  });
  it('isDatarunIDSelected()', () => {
    expect(isDatarunIDSelected(datarunState)).toBe('5f5b0cbb013e4f912fba33ae');
  });
  it('getSelectedPeriodRange()', () => {
    expect(getSelectedPeriodRange(datarunState)).toBe(datarunState.datarun.selectedPeriodRange);
  });
  it('getIsEditingEventRange()', () => {
    expect(getIsEditingEventRange(datarunState)).toBe(false);
  });
  it('getIsEditingEventRangeDone()', () => {
    expect(getIsEditingEventRangeDone(datarunState)).toBe(false);
  });
});
