import React, { Component } from 'react';
import { connect } from 'react-redux';
import { similarShapesResults, getPercentageInterval } from 'src/model/selectors/similarShapes';
import { Collapse } from 'react-collapse';
import './FilterShapes.scss';
import { updateCurrentPercentage } from 'src/model/actions/similarShapes';
import { TriangleDown, TriangleUp } from 'src/components/Common/icons';
import { RootState } from 'src/model/types';

const percentageCount = (): Array<number> => {
  const stepValues = [];
  for (let iterator = 0; iterator <= 100; iterator += 5) {
    stepValues.push(iterator);
  }
  return stepValues;
};

type OwnProps = {
  toggleShapesFiltering: () => void;
  isShapeFilteringVisible: boolean;
};

type StateProps = ReturnType<typeof mapState>;
type DispatchProps = ReturnType<typeof mapDispatch>;
type Props = StateProps & DispatchProps & OwnProps;

class FilterShapes extends Component<Props> {
  renderStepHeight(percentage) {
    const grouppedShapes = this.countSimilarity();
    const graphHeight = 40;
    const shapeIndex = grouppedShapes.findIndex((similarity) => similarity[0] === percentage);
    if (shapeIndex === -1) {
      return 0;
    }
    const shapeHeight = (grouppedShapes[shapeIndex][1] * 100) / graphHeight;

    return shapeHeight;
  }

  grouppedIntervals(): Array<[number, number]> {
    const steps: Array<number> = percentageCount();
    const intervals: Array<[number, number]> = steps.reduce((acc: Array<[number, number]>, elem: number) => {
      if (elem !== 100) {
        const nextStep: number = elem + 5;
        const newEntry = [elem, nextStep] as [number, number];
        acc.push(newEntry);
      }
      return acc;
    }, []);

    return intervals;
  }

  countSimilarity(): Array<[number, number]> {
    const { currentShapes } = this.props;
    const intervals: Array<[number, number]> = this.grouppedIntervals();
    const grouppedShapes: Array<[number, number]> = intervals.map((currentInterval) => {
      const [min, max] = currentInterval;
      return [
        max,
        currentShapes.filter((shape) => shape.similarity * 100 >= min && shape.similarity * 100 <= max).length,
      ];
    });
    return grouppedShapes;
  }

  renderSteps(graph = false) {
    const { setPercentageInterval, percentageInterval } = this.props;
    const percentage = percentageCount();
    const [minPercentage, maxPercentage] = percentageInterval as [number, number];

    return percentage.map((currentPercent: number) => {
      const activePercent: string = currentPercent >= minPercentage && currentPercent <= 100 ? 'active' : '';
      const activeColumn: string = currentPercent > minPercentage && currentPercent <= 100 ? 'active' : '';
      const activeGlissor: string =
        currentPercent === minPercentage || currentPercent === maxPercentage ? 'active' : '';
      return graph ? (
        <li
          key={`step_${currentPercent}`}
          className={`step ${activeColumn}`}
          onClick={() => setPercentageInterval(currentPercent)}
        >
          <span className="step-graph" style={{ height: `${this.renderStepHeight(currentPercent)}%` }} />
        </li>
      ) : (
        <li
          key={`value_${currentPercent}`}
          className={activePercent}
          onClick={() => setPercentageInterval(currentPercent)}
        >
          <span className={`glissor ${activeGlissor}`} />
          <span className="step-value">{currentPercent}</span>
        </li>
      );
    });
  }

  render() {
    const { percentageInterval, toggleShapesFiltering, isShapeFilteringVisible } = this.props;
    const collapseTheme: { collapse: string; content: string } = {
      collapse: 'filter-shapes-collapse',
      content: 'filter-shapes-content',
    };

    const renderArrow = isShapeFilteringVisible ? <TriangleUp /> : <TriangleDown />;

    return (
      <div className="filter-wrapper">
        <div>
          <ul className="info" onClick={() => toggleShapesFiltering()}>
            <li>Filter Results by Similarity</li>
            <li>
              <span>{percentageInterval[0]} - 100%</span>
              <span>{renderArrow}</span>
            </li>
          </ul>
        </div>

        <div className="filter-collapsible">
          <Collapse isOpened={isShapeFilteringVisible} theme={collapseTheme}>
            <div className="filtering">
              <ul>{this.renderSteps(true)}</ul>
              <div className="progress-bar">
                <div className="progress" style={{ width: `${100 - percentageInterval[0]}%` }} />
              </div>
              <ul>{this.renderSteps(false)}</ul>
            </div>
          </Collapse>
        </div>
      </div>
    );
  }
}

const mapState = (state: RootState) => ({
  currentShapes: similarShapesResults(state),
  percentageInterval: getPercentageInterval(state),
});

const mapDispatch = (dispatch: Function) => ({
  setPercentageInterval: (value) => dispatch(updateCurrentPercentage(value)),
});

export default connect<StateProps, DispatchProps, {}, RootState>(mapState, mapDispatch)(FilterShapes);
