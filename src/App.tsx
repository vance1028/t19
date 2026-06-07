import { useState, useEffect, useRef, useCallback } from 'react';
import { DatasetType, ActivationType, NetworkLayer, DataPoint, TrainingState } from './types';
import { generateDataset } from './dataset';
import { NeuralNetwork } from './neuralNetwork';
import { NetworkVisualizer } from './components/NetworkVisualizer';
import { DecisionBoundary } from './components/DecisionBoundary';
import { LossChart } from './components/LossChart';
import { ControlPanel } from './components/ControlPanel';

function App() {
  const [datasetType, setDatasetType] = useState<DatasetType>('linear');
  const [noise, setNoise] = useState(0.05);
  const [trainRatio, setTrainRatio] = useState(0.8);
  const [data, setData] = useState<{ train: DataPoint[]; test: DataPoint[] }>({ train: [], test: [] });
  
  const [layers, setLayers] = useState<NetworkLayer[]>([
    { neurons: 8, activation: 'tanh' },
    { neurons: 8, activation: 'tanh' },
  ]);
  const [learningRate, setLearningRate] = useState(0.1);
  const [regularization, setRegularization] = useState(0);
  
  const [network, setNetwork] = useState<NeuralNetwork | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingState, setTrainingState] = useState<TrainingState>({
    epoch: 0,
    trainLoss: 0,
    testLoss: 0,
    trainAccuracy: 0,
    testAccuracy: 0,
    lossHistory: [],
  });
  const [weights, setWeights] = useState<number[][][]>([]);
  const [layerSizes, setLayerSizes] = useState<number[]>([]);
  const [boundaryVersion, setBoundaryVersion] = useState(0);
  
  const animationRef = useRef<number | null>(null);
  const networkRef = useRef<NeuralNetwork | null>(null);

  const regenerateData = useCallback(() => {
    const newData = generateDataset(datasetType, 200, noise, trainRatio);
    setData(newData);
  }, [datasetType, noise, trainRatio]);

  const initializeNetwork = useCallback(() => {
    const config = { layers, learningRate, regularization };
    const newNetwork = new NeuralNetwork(config);
    networkRef.current = newNetwork;
    setNetwork(newNetwork);
    setLayerSizes(newNetwork.getLayerSizes());
    setWeights(newNetwork.getWeights());
    setTrainingState({
      epoch: 0,
      trainLoss: 0,
      testLoss: 0,
      trainAccuracy: 0,
      testAccuracy: 0,
      lossHistory: [],
    });
  }, [layers, learningRate, regularization]);

  const runStep = useCallback((epochs: number = 1) => {
    const net = networkRef.current;
    if (!net || data.train.length === 0) return;
    
    net.setLearningRate(learningRate);
    net.setRegularization(regularization);
    
    for (let i = 0; i < epochs; i++) {
      net.trainEpoch(data.train, 32);
    }
    
    const trainMetrics = net.evaluate(data.train);
    const testMetrics = net.evaluate(data.test);
    
    setWeights(net.getWeights());
    setLayerSizes(net.getLayerSizes());
    setBoundaryVersion(v => v + 1);
    
    setTrainingState(prev => {
      const newEpoch = prev.epoch + epochs;
      const newHistory = [
        ...prev.lossHistory,
        { epoch: newEpoch, trainLoss: trainMetrics.loss, testLoss: testMetrics.loss },
      ];
      return {
        epoch: newEpoch,
        trainLoss: trainMetrics.loss,
        testLoss: testMetrics.loss,
        trainAccuracy: trainMetrics.accuracy,
        testAccuracy: testMetrics.accuracy,
        lossHistory: newHistory.slice(-500),
      };
    });
  }, [data, learningRate, regularization]);

  const trainLoop = useCallback(() => {
    if (!isTraining) return;
    
    runStep(2);
    
    animationRef.current = requestAnimationFrame(trainLoop);
  }, [isTraining, runStep]);

  useEffect(() => {
    regenerateData();
  }, [regenerateData]);

  useEffect(() => {
    initializeNetwork();
  }, [initializeNetwork]);

  useEffect(() => {
    if (isTraining) {
      trainLoop();
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isTraining, trainLoop]);

  const handleAddLayer = () => {
    setLayers(prev => [...prev, { neurons: 4, activation: 'relu' }]);
    setIsTraining(false);
  };

  const handleRemoveLayer = (index: number) => {
    setLayers(prev => prev.filter((_, i) => i !== index));
    setIsTraining(false);
  };

  const handleUpdateLayer = (index: number, neurons: number, activation: ActivationType) => {
    setLayers(prev => prev.map((l, i) => i === index ? { neurons, activation } : l));
    setIsTraining(false);
  };

  const handleReset = () => {
    setIsTraining(false);
    initializeNetwork();
  };

  const handleStep = () => {
    runStep();
  };

  const handleStart = () => {
    setIsTraining(true);
  };

  const handlePause = () => {
    setIsTraining(false);
  };

  const handleDatasetChange = (type: DatasetType) => {
    setDatasetType(type);
    setIsTraining(false);
  };

  const handleRegenerateData = () => {
    regenerateData();
    setIsTraining(false);
    handleReset();
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%)', padding: 20 }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <h1 style={{ 
          textAlign: 'center', 
          margin: 0, 
          marginBottom: 20, 
          fontSize: 28, 
          fontWeight: 700, 
          color: '#1e293b',
          letterSpacing: '-0.5px',
        }}>
          🧠 神经网络教学沙盘 — 亲手看见"学习"是怎么发生的
        </h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 280px', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <ControlPanel
              datasetType={datasetType}
              onDatasetChange={handleDatasetChange}
              noise={noise}
              onNoiseChange={setNoise}
              trainRatio={trainRatio}
              onTrainRatioChange={setTrainRatio}
              layers={layers}
              onAddLayer={handleAddLayer}
              onRemoveLayer={handleRemoveLayer}
              onUpdateLayer={handleUpdateLayer}
              learningRate={learningRate}
              onLearningRateChange={(lr) => { setLearningRate(lr); }}
              regularization={regularization}
              onRegularizationChange={(reg) => { setRegularization(reg); }}
              isTraining={isTraining}
              onStart={handleStart}
              onPause={handlePause}
              onStep={handleStep}
              onReset={handleReset}
              onRegenerateData={handleRegenerateData}
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ 
              background: '#ffffff', 
              borderRadius: 12, 
              padding: 16, 
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}>
              <h3 style={{ margin: 0, marginBottom: 12, fontSize: 16, fontWeight: 600, color: '#1e293b' }}>
                📈 决策边界
              </h3>
              <div style={{ maxWidth: 450, margin: '0 auto' }}>
                <DecisionBoundary key={boundaryVersion} network={network} trainData={data.train} testData={data.test} />
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: 16, 
                marginTop: 12, 
                fontSize: 12,
                flexWrap: 'wrap',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#3b82f6' }}></span>
                  类别 1
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }}></span>
                  类别 0
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 12, height: 8, borderRadius: 2, border: '2px solid #ffffff' }}></span>
                  训练集
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 10, height: 6, borderRadius: 2, border: '1.5px solid #e2e8f0' }}></span>
                  测试集
                </span>
              </div>
            </div>
            
            <div style={{ 
              background: '#ffffff', 
              borderRadius: 12, 
              padding: 16, 
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}>
              <h3 style={{ margin: 0, marginBottom: 12, fontSize: 16, fontWeight: 600, color: '#1e293b' }}>
                📉 Loss 曲线
              </h3>
              <LossChart data={trainingState.lossHistory} />
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ 
              background: '#ffffff', 
              borderRadius: 12, 
              padding: 16, 
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}>
              <h3 style={{ margin: 0, marginBottom: 12, fontSize: 16, fontWeight: 600, color: '#1e293b' }}>
                🔢 网络结构
              </h3>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <NetworkVisualizer layerSizes={layerSizes} weights={weights} />
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: 16, 
                marginTop: 8, 
                fontSize: 11,
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 20, height: 3, background: 'rgba(59, 130, 246, 0.8)' }}></span>
                  正权重
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 20, height: 3, background: 'rgba(239, 68, 68, 0.8)' }}></span>
                  负权重
                </span>
              </div>
            </div>
            
            <div style={{ 
              background: '#ffffff', 
              borderRadius: 12, 
              padding: 16, 
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}>
              <h3 style={{ margin: 0, marginBottom: 12, fontSize: 16, fontWeight: 600, color: '#1e293b' }}>
                📊 训练状态
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#64748b' }}>迭代轮数</span>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>{trainingState.epoch}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#64748b' }}>训练 Loss</span>
                  <span style={{ fontWeight: 600, color: '#3b82f6' }}>{trainingState.trainLoss.toFixed(4)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#64748b' }}>测试 Loss</span>
                  <span style={{ fontWeight: 600, color: '#f59e0b' }}>{trainingState.testLoss.toFixed(4)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#64748b' }}>训练准确率</span>
                  <span style={{ fontWeight: 600, color: '#22c55e' }}>{(trainingState.trainAccuracy * 100).toFixed(1)}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#64748b' }}>测试准确率</span>
                  <span style={{ fontWeight: 600, color: '#22c55e' }}>{(trainingState.testAccuracy * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div style={{ 
              background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)', 
              borderRadius: 12, 
              padding: 16, 
              border: '1px solid #bfdbfe',
            }}>
              <h4 style={{ margin: 0, marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#1e40af' }}>
                💡 试试看
              </h4>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: '#3730a3', lineHeight: 1.6 }}>
                <li>选"螺旋"数据集，加一层隐藏层看看</li>
                <li>试试把学习率调太大或太小</li>
                <li>增加噪声观察过拟合现象</li>
                <li>单步执行看看权重如何变化</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
