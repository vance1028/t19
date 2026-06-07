import { ActivationType, DataPoint, NetworkConfig } from './types';

function relu(x: number): number {
  return Math.max(0, x);
}

function reluDerivative(x: number): number {
  return x > 0 ? 1 : 0;
}

function tanh(x: number): number {
  return Math.tanh(x);
}

function tanhDerivative(x: number): number {
  const t = tanh(x);
  return 1 - t * t;
}

function sigmoid(x: number): number {
  if (x >= 0) {
    const z = Math.exp(-x);
    return 1 / (1 + z);
  } else {
    const z = Math.exp(x);
    return z / (1 + z);
  }
}

function sigmoidDerivative(x: number): number {
  const s = sigmoid(x);
  return s * (1 - s);
}

function getActivation(type: ActivationType): (x: number) => number {
  switch (type) {
    case 'relu': return relu;
    case 'tanh': return tanh;
    case 'sigmoid': return sigmoid;
  }
}

function getActivationDerivative(type: ActivationType): (x: number) => number {
  switch (type) {
    case 'relu': return reluDerivative;
    case 'tanh': return tanhDerivative;
    case 'sigmoid': return sigmoidDerivative;
  }
}

function heInit(fanIn: number): number {
  const std = Math.sqrt(2 / fanIn);
  return (Math.random() * 2 - 1) * std;
}

function xavierInit(fanIn: number, fanOut: number): number {
  const limit = Math.sqrt(6 / (fanIn + fanOut));
  return (Math.random() * 2 - 1) * limit;
}

export interface LayerData {
  weights: number[][];
  biases: number[];
  preActivations: number[];
  activations: number[];
}

export class NeuralNetwork {
  private layers: LayerData[] = [];
  private activations: ActivationType[] = [];
  private learningRate: number;
  private regularization: number;
  private layerSizes: number[];

  constructor(config: NetworkConfig) {
    this.learningRate = config.learningRate;
    this.regularization = config.regularization;
    this.layerSizes = [2, ...config.layers.map(l => l.neurons), 1];
    this.activations = [...config.layers.map(l => l.activation), 'sigmoid'];
    this.initializeWeights();
  }

  private initializeWeights(): void {
    this.layers = [];
    for (let i = 0; i < this.layerSizes.length - 1; i++) {
      const fanIn = this.layerSizes[i];
      const fanOut = this.layerSizes[i + 1];
      const activation = this.activations[i];
      
      const weights: number[][] = [];
      for (let j = 0; j < fanOut; j++) {
        const row: number[] = [];
        for (let k = 0; k < fanIn; k++) {
          if (activation === 'relu') {
            row.push(heInit(fanIn));
          } else {
            row.push(xavierInit(fanIn, fanOut));
          }
        }
        weights.push(row);
      }
      
      const biases: number[] = new Array(fanOut).fill(0);
      
      this.layers.push({
        weights,
        biases,
        preActivations: new Array(fanOut).fill(0),
        activations: new Array(fanOut).fill(0),
      });
    }
  }

  public forward(input: number[]): number {
    let current = [...input];
    
    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i];
      const activationFn = getActivation(this.activations[i]);
      const preActivations: number[] = [];
      const activations: number[] = [];
      
      for (let j = 0; j < layer.weights.length; j++) {
        let z = layer.biases[j];
        for (let k = 0; k < current.length; k++) {
          z += layer.weights[j][k] * current[k];
        }
        preActivations.push(z);
        activations.push(activationFn(z));
      }
      
      layer.preActivations = preActivations;
      layer.activations = activations;
      current = activations;
    }
    
    return current[0];
  }

  public trainBatch(batch: DataPoint[]): number {
    const weightGradients: number[][][] = this.layers.map(layer =>
      layer.weights.map(row => row.map(() => 0))
    );
    const biasGradients: number[][] = this.layers.map(layer =>
      layer.biases.map(() => 0)
    );
    
    let totalLoss = 0;
    
    for (const point of batch) {
      const input = [point.x, point.y];
      const prediction = this.forward(input);
      const target = point.label;
      
      totalLoss += this.binaryCrossEntropy(prediction, target);
      
      const outputActivationDerivative = getActivationDerivative('sigmoid');
      let delta: number[] = [
        (prediction - target) * outputActivationDerivative(this.layers[this.layers.length - 1].preActivations[0])
      ];
      
      for (let i = this.layers.length - 1; i >= 0; i--) {
        const layer = this.layers[i];
        const prevActivations = i === 0 ? input : this.layers[i - 1].activations;
        const activationDerivative = getActivationDerivative(this.activations[i]);
        
        for (let j = 0; j < layer.weights.length; j++) {
          for (let k = 0; k < prevActivations.length; k++) {
            weightGradients[i][j][k] += delta[j] * prevActivations[k];
          }
          biasGradients[i][j] += delta[j];
        }
        
        if (i > 0) {
          const nextDelta: number[] = new Array(this.layers[i - 1].weights.length).fill(0);
          for (let j = 0; j < layer.weights.length; j++) {
            for (let k = 0; k < layer.weights[j].length; k++) {
              nextDelta[k] += delta[j] * layer.weights[j][k];
            }
          }
          for (let k = 0; k < nextDelta.length; k++) {
            nextDelta[k] *= activationDerivative(this.layers[i - 1].preActivations[k]);
          }
          delta = nextDelta;
        }
      }
    }
    
    const batchSize = batch.length;
    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i];
      for (let j = 0; j < layer.weights.length; j++) {
        for (let k = 0; k < layer.weights[j].length; k++) {
          const gradient = weightGradients[i][j][k] / batchSize + this.regularization * layer.weights[j][k];
          layer.weights[j][k] -= this.learningRate * gradient;
        }
        layer.biases[j] -= this.learningRate * (biasGradients[i][j] / batchSize);
      }
    }
    
    return totalLoss / batchSize;
  }

  private binaryCrossEntropy(prediction: number, target: number): number {
    const eps = 1e-7;
    const p = Math.max(eps, Math.min(1 - eps, prediction));
    return -target * Math.log(p) - (1 - target) * Math.log(1 - p);
  }

  public evaluate(data: DataPoint[]): { loss: number; accuracy: number } {
    let totalLoss = 0;
    let correct = 0;
    
    for (const point of data) {
      const prediction = this.forward([point.x, point.y]);
      totalLoss += this.binaryCrossEntropy(prediction, point.label);
      const predictedLabel = prediction >= 0.5 ? 1 : 0;
      if (predictedLabel === point.label) correct++;
    }
    
    return {
      loss: totalLoss / data.length,
      accuracy: correct / data.length,
    };
  }

  public getWeights(): number[][][] {
    return this.layers.map(layer => layer.weights.map(row => [...row]));
  }

  public getBiases(): number[][] {
    return this.layers.map(layer => [...layer.biases]);
  }

  public getLayerSizes(): number[] {
    return [...this.layerSizes];
  }

  public setLearningRate(lr: number): void {
    this.learningRate = lr;
  }

  public setRegularization(reg: number): void {
    this.regularization = reg;
  }
}
