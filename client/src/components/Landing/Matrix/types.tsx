import { ExperimentDataType } from 'src/model/types';

export type TagStats = {
  [index: string]: number;
};

export type MatrixScale = {
  maxTagNum: number;
  maxEventNum: number;
  maxScore: number;
};

export interface MatrixOption {
  height: number;
  width: number;
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  matrixHeight: number;
  matrixWidth: number;
}

export interface MatrixProps {
  experiment: ExperimentDataType;
  tagStats: TagStats;
  scale: MatrixScale;
}
