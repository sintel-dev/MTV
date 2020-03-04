import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as d3 from 'd3';
import { getSelectedExperimentData } from '../../../model/selectors/experiment';
import Loader from '../../Common/Loader';
import Header from './Header';
import {
  getDatarunDetails,
  getSelectedPeriodLevel,
  getReviewPeriod,
  getIsEditingEventRange,
} from '../../../model/selectors/datarun';
import { getWrapperSize, drawArc, getDataScale } from './SidebarUtils';
import { setPeriodLevelAction, reviewPeriodAction } from '../../../model/actions/datarun';
import './Sidebar.scss';

const graphSpacing = 15;
class Sidebar extends Component {
  constructor(...props) {
    super(...props);
    this.state = {
      width: 0,
      height: 0,
    };
  }

  componentDidMount() {
    const { width, height } = getWrapperSize();
    this.setState(
      {
        width,
        height,
        zoomValue: null,
      },
      () => {
        this.initZoom();
      },
    );
  }

  initZoom() {
    const { width, height } = this.state;
    let zoom = null;

    zoom = d3
      .zoom()
      .scaleExtent([1, Infinity])
      .translateExtent([
        [0, 0],
        [width, height],
      ])
      .extent([
        [0, 0],
        [width, height],
      ])
      .on('zoom', () =>
        this.setState({
          zoomValue: d3.event.transform,
        }),
      );

    d3.select('#multiPeriodChart .zoom').call(zoom);
  }

  getFeatureCellCoords(index) {
    const { width } = this.state;
    const nCols = this.getColAmount();
    const diameter = width / nCols;

    const colIteration = index % nCols > 0 ? index % nCols : 0;
    const rowIteration = Math.floor(index / nCols);
    const horizontalShift = diameter * colIteration + diameter / 2;
    const verticalShift = rowIteration * diameter + diameter / 2;
    return { horizontalShift, verticalShift };
  }

  getPathData(periodRange) {
    const { width } = this.state;
    const nCols = this.getColAmount();
    const radius = width / nCols / 2 - graphSpacing;

    const { area } = getDataScale(radius * 0.1, radius, periodRange);
    return area(periodRange);
  }

  getColAmount() {
    const { selectedPeriodLevel, reviewRange } = this.props;

    let nCols = 3;
    if (!reviewRange) {
      if (selectedPeriodLevel.year) {
        nCols = 4;
      }
      if (selectedPeriodLevel.month) {
        nCols = 6;
      }
    } else {
      if (reviewRange === 'year') {
        nCols = 3;
      }
      if (reviewRange === 'month') {
        nCols = 4;
      }
      if (reviewRange === 'day') {
        nCols = 6;
      }
    }

    return nCols;
  }

  drawData() {
    const { width, zoomValue } = this.state;
    const { setPeriodLevel, dataRun, isEditingEventRange } = this.props;
    const { period, grouppedEvents } = dataRun;
    const radius = width / this.getColAmount() / 2 - graphSpacing;
    return (
      width > 0 &&
      period.map((currentPeriod, periodIndex) => {
        const { horizontalShift, verticalShift } = this.getFeatureCellCoords(periodIndex);
        const arcData = drawArc(currentPeriod, grouppedEvents, radius, periodIndex);

        return (
          <g transform={zoomValue} key={currentPeriod.name}>
            <g
              className="feature-cell"
              transform={`translate(${horizontalShift}, ${verticalShift})`}
              onClick={() => !isEditingEventRange && setPeriodLevel(currentPeriod)}
            >
              <path
                id={`path_${currentPeriod.name}`}
                d={this.getPathData(currentPeriod.bins)}
                className="feature-area radial-cursor"
              />
              <clipPath id={`clip_${currentPeriod.name}`}>
                <use href={`#path_${currentPeriod.name}`} />
              </clipPath>
              <g className="target">
                <circle r={radius} />
                <circle r={radius * 0.7} />
                <circle r={radius * 0.4} />
                <circle r={radius * 0.1} className="target-info" />
                <line x1={-radius} x2={radius} />
                <line y1={-radius} y2={radius} />

                <text className="radial-text" y={radius + 15} x={0}>
                  {currentPeriod.name}
                </text>
                {arcData.length &&
                  arcData.map(arc => (
                    <path key={arc.eventID} d={arc.pathData} className={arc.tag} fill={arc.tagColor} />
                  ))}
              </g>
              <circle
                r={radius * 0.85}
                className="wrapper"
                fill="url(#blueGradient)"
                clipPath={`url(#clip_${currentPeriod.name})`}
              />
            </g>
          </g>
        );
      })
    );
  }

  render() {
    const { experimentData, dataRun, selectedPeriodLevel, reviewPeriod, reviewRange, isEditingEventRange } = this.props;
    const { period } = dataRun;
    const { width, height } = this.state;
    return (
      <div className="sidebar">
        <Loader isLoading={experimentData.isExperimentDataLoading}>
          <Header
            headerTitle={dataRun.signal}
            reviewPeriod={reviewPeriod}
            reviewRange={reviewRange}
            currentPeriod={selectedPeriodLevel}
            isEditingEventRange={isEditingEventRange}
            dataRun={dataRun}
            selectedPeriodLevel={selectedPeriodLevel}
          />
          <div className="data-wrapper scroll-style" id="dataWrapper">
            {/* <div style={{ height: '700px' }}>asd</div> */}
            <svg id="multiPeriodChart" width={width} height={height}>
              <rect className="zoom" width={width} height={height} />
              {this.drawData(period)}
              <defs>
                <radialGradient id="blueGradient">
                  <stop offset="0" stopColor="#B2C1FF" />
                  <stop offset="100" stopColor="rgba(216,216,216,0)" />
                </radialGradient>
              </defs>
            </svg>
          </div>
        </Loader>
      </div>
    );
  }
}

export default connect(
  state => ({
    experimentData: getSelectedExperimentData(state),
    dataRun: getDatarunDetails(state),
    selectedPeriodLevel: getSelectedPeriodLevel(state),
    reviewRange: getReviewPeriod(state),
    isEditingEventRange: getIsEditingEventRange(state),
  }),
  dispatch => ({
    setPeriodLevel: periodLevel => dispatch(setPeriodLevelAction(periodLevel)),
    reviewPeriod: periodLevel => dispatch(reviewPeriodAction(periodLevel)),
  }),
)(Sidebar);
