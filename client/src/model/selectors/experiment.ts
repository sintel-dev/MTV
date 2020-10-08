import * as d3 from 'd3';
import { createSelector } from 'reselect';
import * as _ from 'lodash';
import { RootState, EventDataType } from '../types';
import { months } from '../utils/Utils';

export const getFilterTags = (state) => state.datarun.filterTags;
export const getSelectedExperimentData = (state: RootState) => state.selectedExperimentData;

export const filteringTags = createSelector(
  [getSelectedExperimentData, getFilterTags],
  (selectedExpedimentData, filterTags) => {
    if (selectedExpedimentData.isExperimentDataLoading || !filterTags.length) {
      return [];
    }

    const tags = filterTags.map((tag) => tag.value);

    if (tags.includes('Untagged')) {
      tags.push(null);
    }

    return tags;
  },
);

const groupDataBy = (
  prediction: {
    names: string[];
    data: number[][];
  },
  option: string,
) => prediction.data.map((predData) => [Math.trunc(predData[0]) * 1000, predData[prediction.names.indexOf(option)]]);

const groupByEventWindows = (events: EventDataType[], timestamps: number[]) =>
  events.map(
    (event) =>
      [
        timestamps.indexOf(event.start_time * 1000),
        timestamps.indexOf(event.stop_time * 1000),
        event.score,
        event.id,
        event.tag,
      ] as [number, number, number, string, string],
  );

const groupDataByPeriod = (data) => {
  let result = [];

  for (let yearIterator = 0; yearIterator < data.length; yearIterator += 1) {
    const year = {
      level: 'year',
      name: data[yearIterator].year,
      bins: [],
      counts: [],
      children: [],
    };
    result.push(year);

    for (let monthIterator = 0; monthIterator < 12; monthIterator += 1) {
      const month = {
        level: 'month',
        name: months[monthIterator],
        bins: [],
        counts: [],
        children: [],
        parent: year,
      };
      year.children.push(month);

      for (let dayIterator = 0; dayIterator < data[yearIterator].data[monthIterator].length; dayIterator += 1) {
        let day = {
          level: 'day',
          name: dayIterator + 1,
          bins: _.cloneDeep(data[yearIterator].data[monthIterator][dayIterator].means),
          counts: _.cloneDeep(data[yearIterator].data[monthIterator][dayIterator].counts),
          children: undefined,
          parent: month,
        };

        let dayData = data[yearIterator].data[monthIterator][dayIterator];
        let count = _.sum(dayData.counts);
        let mean = _.sum(dayData.means) / dayData.means.length;

        // for (let dayBinIterator = 0; dayBinIterator < day.bins.length; dayBinIterator += 1) {
        //   day.bins[dayBinIterator] =
        //     day.counts[dayBinIterator] > 0 ? day.bins[dayBinIterator] : -Number.MAX_SAFE_INTEGER;
        // }
        // if (count == 0) {
        //   mean = -Number.MAX_SAFE_INTEGER;
        // }

        // push day
        month.children.push(day);

        // push day to the year
        year.bins.push(mean);
        year.counts.push(count);

        // push day to the month
        month.bins.push(mean);
        month.counts.push(count);
      }
    }

    // aggregate 7 days (bins) into one
    let i = 0;
    let nbins = [];
    let ncounts = [];
    while (i < year.bins.length) {
      let s = 0;
      let c = 0;
      let v = 0;
      for (let j = 0; j < 7; j += 1) {
        s += year.bins[i + j];
        c += year.counts[i + j];
      }
      i += 7;
      v = s / 7;
      if (i === 364) {
        s += year.bins[364];
        c += year.counts[364];
        v = s / 8;
        if (year.bins.length === 366) {
          s += year.bins[365];
          c += year.counts[365];
          v = s / 9;
        }
        i = 367;
      }
      if (c === 0) {
        // clamp(true)
        // so the minimum integer will always return radius 0
        nbins.push(-Number.MAX_SAFE_INTEGER);
      } else {
        nbins.push(v);
      }
      ncounts.push(c);
    }
    // year.bins = nbins;
    // year.counts = ncounts;
  }

  return result;
};

const normalizePeriodRange = (periodData) => {
  let minRange = Number.MAX_SAFE_INTEGER;
  let maxRange = Number.MIN_SAFE_INTEGER;
  let meanSum = 0;
  let meanCount = 0;

  periodData.forEach((year) => {
    for (let monthIterator = 0; monthIterator < year.children.length; monthIterator += 1) {
      for (let dayIterator = 0; dayIterator < year.children[monthIterator].children.length; dayIterator += 1) {
        const { counts, bins } = year.children[monthIterator].children[dayIterator];
        for (let i = 0; i < bins.length; i += 1) {
          if (counts[i] !== 0) {
            minRange = Math.min(minRange, bins[i]);
            maxRange = Math.max(maxRange, bins[i]);
            meanCount += 1;
            meanSum += bins[i];
          }
        }
      }
    }
  });
  return { minRange, maxRange, mean: meanSum / meanCount };
};

const normalizePeriodData = (periodData) => {
  const { minRange, maxRange, mean } = normalizePeriodRange(periodData);
  const normalizeScale = d3.scaleLinear().domain([minRange, maxRange]).range([0, 1]).clamp(true);

  let previousHoldValueY = mean;
  let previousHoldValueM = mean;
  let previousHoldValueD = mean;
  periodData.forEach((year) => {
    let countsY = year.counts;
    year.bins = _.map(year.bins, (bin, i) => {
      let newBin: number;
      if (countsY[i] === 0) {
        newBin = normalizeScale(previousHoldValueY);
      } else {
        newBin = normalizeScale(bin);
        previousHoldValueY = bin;
      }
      return newBin;
    });

    // @TODO - first prio - address this for in for
    for (let monthIterator = 0; monthIterator < year.children.length; monthIterator += 1) {
      let countsM = year.children[monthIterator].counts;
      year.children[monthIterator].bins = _.map(year.children[monthIterator].bins, (bin, i) => {
        let newBin: number;
        if (countsM[i] === 0) {
          newBin = normalizeScale(previousHoldValueM);
        } else {
          newBin = normalizeScale(bin);
          previousHoldValueM = bin;
        }
        return newBin;
      });
      for (let dayIterator = 0; dayIterator < year.children[monthIterator].children.length; dayIterator += 1) {
        let countsD = year.children[monthIterator].children[dayIterator].counts;
        year.children[monthIterator].children[dayIterator].bins = _.map(
          year.children[monthIterator].children[dayIterator].bins,
          (bin, i) => {
            let newBin: number;
            if (countsD[i] === 0) {
              newBin = normalizeScale(previousHoldValueD);
            } else {
              newBin = normalizeScale(bin);
              previousHoldValueD = bin;
            }
            return newBin;
          },
        );
      }
    }
  });
};

export const getProcessedDataRuns = createSelector(
  [getSelectedExperimentData, filteringTags],
  (experimentData, filterTags) => {
    if (experimentData.isExperimentDataLoading) {
      return [];
    }

    const timeSeriesDataLength = experimentData.data.dataruns.map((datarun) => datarun.prediction.data.length);

    const maxTimeSeriesLength = Math.max(...timeSeriesDataLength);
    const maxTimeSeriesData = experimentData.data.dataruns.filter(
      (data) => data.prediction.data.length === maxTimeSeriesLength,
    )[0];

    return experimentData.data.dataruns.map((datarun) => {
      const { prediction, events, raw } = datarun;
      const timeSeries = groupDataBy(prediction, 'y_raw') as [number, number][];
      const maxTimeSeries = groupDataBy(maxTimeSeriesData.prediction, 'y_raw') as [number, number][];
      const timeseriesPred = groupDataBy(prediction, 'y_raw_hat') as [number, number][];
      const timeseriesErr = groupDataBy(prediction, 'es_raw') as [number, number][];
      const period = groupDataByPeriod(raw);

      normalizePeriodData(period);

      const filteredEvents =
        filterTags && filterTags.length
          ? events.filter((currentEvent) => filterTags.includes(currentEvent.tag))
          : events;

      const sortedEvents = filteredEvents
        .map((currentEvent) => currentEvent)
        .sort((current, next) => current.start_time - next.start_time);

      const eventWindows = groupByEventWindows(
        sortedEvents,
        timeSeries.map((series) => series[0]),
      );

      const filteredEventWindows = filterTags.length
        ? eventWindows.filter((currentWindow) => filterTags.includes(currentWindow[4]))
        : eventWindows;

      return {
        ...datarun,
        timeSeries,
        timeseriesPred,
        timeseriesErr,
        eventWindows: filteredEventWindows,
        events: sortedEvents,
        period,
        maxTimeSeries,
      };
    });
  },
);

export const getCurrentExperimentDetails = (state) => state.experiments.experimentDetails;
