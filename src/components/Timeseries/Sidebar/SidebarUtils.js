import * as d3 from 'd3';
import { colorSchemes } from '../FocusChart/Constants';
import { fromMonthToIndex } from '../../../model/utils/Utils';

export const MAX_EVENTS_ACTIVITY = 5;

export const getWrapperSize = () => {
  const sidebarHeight = document.querySelector('.right-sidebar').clientHeight - 75; // padding-top and bottom
  const sidebarHeaderHeight = document.querySelector('.period-control').clientHeight + 25; // margin-bottom;
  const wrapper = document.querySelector('#dataWrapper');

  const height = sidebarHeight - sidebarHeaderHeight;
  const width = wrapper.clientWidth - 22; // scrollbar offset

  return { width, height };
};

export const drawArc = (currentPeriod, periodEvents, radius, periodIndex) => {
  const { level } = currentPeriod;
  let arcStart = 0;
  let arcStop = 0;
  let base = 0;
  let arcData = [];
  const circleMonths = (2 * Math.PI) / 12;
  const circleHours = (2 * Math.PI) / 24;

  const secondsInMonth = 2629743.83;
  const secondsInDay = 86400;

  const arc = d3
    .arc()
    .innerRadius(radius - 0)
    .outerRadius(radius + 4);

  if (level === 'year') {
    const yearHasEvents = periodEvents && periodEvents[currentPeriod.name];
    if (yearHasEvents) {
      const yearEvents = periodEvents[currentPeriod.name].events;
      Object.values(yearEvents).forEach((event) => {
        const { start_time, stop_time, tag, id } = event;
        base = new Date(Number(currentPeriod.name)).getTime() / 1000;
        arcStart = ((start_time - base) / secondsInMonth) * circleMonths;
        arcStop = ((stop_time - base) / secondsInMonth) * circleMonths;
        arc.startAngle(arcStart).endAngle(arcStop);
        const tagColor = colorSchemes[tag] || colorSchemes.Untagged;
        arcData.push({ tag, tagColor, pathData: arc(), eventID: id });
      });
    }
  }

  if (level === 'month') {
    arc.outerRadius(radius + 3);
    const year = currentPeriod.parent.name;
    const monthEvents = periodEvents[year] && periodEvents[year].months[fromMonthToIndex(currentPeriod.name)];
    if (monthEvents !== undefined) {
      Object.values(monthEvents.events).forEach((event) => {
        const { start_time, stop_time, tag, id } = event;
        const daysInMonth = new Date(Number(year), periodIndex + 1, 0).getDate();
        const circleDays = (2 * Math.PI) / daysInMonth;
        base = new Date(year, fromMonthToIndex(currentPeriod.name)).getTime() / 1000;
        arcStart = ((start_time - base) / secondsInDay) * circleDays;
        arcStop = ((stop_time - base) / secondsInDay) * circleDays;

        arc.startAngle(arcStart).endAngle(arcStop);
        const tagColor = colorSchemes[tag] || colorSchemes.Untagged;
        arcData.push({ tag, tagColor, pathData: arc(), eventID: id });
      });
    }
  }

  if (level === 'day') {
    arc.outerRadius(radius + 2);
    const year = currentPeriod.parent.parent.name;
    const month = currentPeriod.parent.name;
    const monthNumber = fromMonthToIndex(month);
    const dayEvents =
      periodEvents[year] && periodEvents[year].months[monthNumber] && periodEvents[year].months[monthNumber].days;

    if (dayEvents !== undefined) {
      if (dayEvents[periodIndex]) {
        const { start_time, stop_time, tag, id } = dayEvents[periodIndex];
        base = new Date(year, monthNumber, periodIndex).getTime() / 1000;
        arcStart = ((start_time - base) / 3600) * circleHours;
        arcStop = ((stop_time - base) / 3600) * circleHours;
        arc.startAngle(arcStart).endAngle(arcStop);
        const tagColor = colorSchemes[tag] || colorSchemes.Untagged;
        arcData.push({ tag, tagColor, pathData: arc(), eventID: id });
      }
    }
  }
  return arcData;
};

export const getDataScale = (innerRadius, outerRadius, periodRange, relativaScale, currentPeriodExtent) => {
  const scaleAngle = d3
    .scaleLinear()
    .range([0, 2 * Math.PI])
    .domain([0, periodRange.length - 0.08]);

  const scaleRadius = d3.scaleLinear().range([innerRadius, outerRadius]);
  if (relativaScale) {
    scaleRadius.domain([0, currentPeriodExtent[1]]);
  } else {
    scaleRadius.domain([0, 1]);
  }

  const area = d3
    .areaRadial()
    .angle((d, i) => scaleAngle(i))
    .innerRadius(() => scaleRadius(0))
    .outerRadius((d) => scaleRadius(d))
    .curve(d3.curveCardinalClosed);

  const area0 = d3
    .areaRadial()
    .angle((d, i) => {
      scaleAngle(i);
    })
    .innerRadius(() => scaleRadius(0))
    .outerRadius(() => scaleRadius(0))
    .curve(d3.curveCardinalClosed);

  return { scaleAngle, scaleRadius, area, area0 };
};
