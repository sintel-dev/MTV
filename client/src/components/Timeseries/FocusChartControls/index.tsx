import React from 'react';
import { connect } from 'react-redux';
import { RootState } from 'src/model/types';
import { togglePredictionsAction, addNewEventAction } from '../../../model/actions/datarun';
import { isPredictionEnabled, getIsAddingNewEvents } from '../../../model/selectors/datarun';

import './FocusChartControls.scss';

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;
type Props = StateProps & DispatchProps;

const FocusChartControls: React.FC<Props> = (props) => {
  const { isAddingEvent, togglePredictions, addNewEvent, isEnabledPrediction } = props;
  return (
    <div className="chart-controls" id="chartControls">
      <div className="legend">
        <p>Signal Focused View</p>
      </div>

      <div className="controls">
        <div className="linechart-controls">
          <div className="row">
            <div className="switch-control">
              <div className="row">
                <label htmlFor="showPredictions">
                  <input
                    type="checkbox"
                    id="showPredictions"
                    checked={isEnabledPrediction}
                    onChange={(event) => togglePredictions(event.target.checked)}
                  />
                  <span className="switch" />
                  Show Predictions
                </label>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-add-event"
            disabled={isAddingEvent}
            onClick={() => addNewEvent(!isAddingEvent)}
          >
            <span>+</span>
            Add Event
          </button>
        </div>
      </div>
    </div>
  );
};

const mapState = (state: RootState) => ({
  isEnabledPrediction: isPredictionEnabled(state),
  isAddingEvent: getIsAddingNewEvents(state),
});

const mapDispatch = (dispatch: Function) => ({
  togglePredictions: (event) => dispatch(togglePredictionsAction(event)),
  addNewEvent: (isAddingEvent) => dispatch(addNewEventAction(isAddingEvent)),
});

export default connect<StateProps, DispatchProps, {}, RootState>(mapState, mapDispatch)(FocusChartControls);
