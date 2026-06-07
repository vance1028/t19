export type ActivationType = 'relu' | 'tanh' | 'sigmoid';

export type DatasetType = 'linear' | 'circle' | 'xor' | 'spiral';

export interface DataPoint {
  x: number;
  y: number;
  label: number;
}

export interface NetworkLayer {
  neurons: number;
  activation: ActivationType;
}

export interface NetworkConfig {
  layers: NetworkLayer[];
  learningRate: number;
  regularization: number;
}

export interface TrainingState {
  epoch: number;
  trainLoss: number;
  testLoss: number;
  trainAccuracy: number;
  testAccuracy: number;
  lossHistory: { epoch: number; trainLoss: number; testLoss: number }[];
}
