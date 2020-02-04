import {
  SELECT_DATARUN,
  SET_TIMESERIES_PERIOD,
  SelectDatarunAction,
  SetTimeseriesPeriodAction,
} from '../types/datarun';

export function selectDatarun(datarunID: string) {
  return function(dispatch) {
    const action: SelectDatarunAction = {
      type: SELECT_DATARUN,
      datarunID,
    };
    dispatch(action);
  };
}

export function setTimeseriesPeriod(eventRange: [number, number]) {
  return function(dispatch) {
    const action: SetTimeseriesPeriodAction = {
      type: SET_TIMESERIES_PERIOD,
      eventRange,
    };
    dispatch(action);
  };
}