import * as d3 from 'd3';
import { FocusChartConstants } from './Constants';
import { fromMonthToIndex, maxDaysInMonth, toTimestamp } from '../../../model/utils/Utils';

export const timeIntervals = ['30 days', '21 days', '14 days', '7 days', '5 days', '3 days', '2 days', '1 day'];
const { TRANSLATE_TOP } = FocusChartConstants;

export const getWrapperSize = () => {
  const wrapperOffsetMargin = 40;
  const overViewHeight: number = document.querySelector('#overview-wrapper').clientHeight;
  const chartControlsHeight: number = document.querySelector('#chartControls').clientHeight + 10;
  const leftSidebarHeight: number = document.querySelector('.left-sidebar').clientHeight;
  const height: number =
    leftSidebarHeight - (overViewHeight + TRANSLATE_TOP + wrapperOffsetMargin + chartControlsHeight);
  const width: number = document.querySelector('.focus-chart').clientWidth;
  return { width, height };
};

export const normalizeHanlers = (chart: string) => {
  const brushHandlers = d3.selectAll(`.${chart} rect.handle`);
  const overlay = d3.select(`.${chart} .selection`);

  if (overlay[Object.keys(overlay)[0]][0][0] === null) {
    return;
  }

  const overlayWidth: string | null = overlay.attr('width');
  if (overlayWidth === '0') {
    return;
  }

  const { height } = getWrapperSize();
  brushHandlers
    .attr('y', () => height / 2 - height / 6)
    .attr('height', () => height / 4)
    .attr('ry', 3);
};

type SelectedPeriod = {
  level: string;
  year: number;
  month: string | null;
};

export const getSelectedRange = (selectedPeriod: SelectedPeriod, maxTimeSeries: Array<[number, number]>) => {
  let dateRangeStart = 0;
  let dateRangeStop = 0;

  const { level, year, month } = selectedPeriod;
  if (level === 'year') {
    dateRangeStart = toTimestamp(`01/01/${year} 00:00:00`);
    dateRangeStop = toTimestamp(`12/31/${year} 23:59:59`);
  }

  if (level === 'month') {
    const monthIndex: number = fromMonthToIndex(month);
    const maxMonthDays: number = maxDaysInMonth(year, monthIndex);
    dateRangeStart = toTimestamp(`${monthIndex}/01/${year} 00:00:00`);
    dateRangeStop = toTimestamp(`${monthIndex}/${maxMonthDays}/${year} 23:59:59`);
  }

  if (level === null) {
    dateRangeStart = maxTimeSeries[0][0] / 1000;
    dateRangeStop = maxTimeSeries[maxTimeSeries.length - 1][0] / 1000;
  }

  return { dateRangeStart, dateRangeStop };
};
