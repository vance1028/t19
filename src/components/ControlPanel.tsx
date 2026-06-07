import React from 'react';
import { DatasetType, ActivationType, NetworkLayer } from '../types';

interface ControlPanelProps {
  datasetType: DatasetType;
  onDatasetChange: (type: DatasetType) => void;
  noise: number;
  onNoiseChange: (noise: number) => void;
  trainRatio: number;
  onTrainRatioChange: (ratio: number) => void;
  
  layers: NetworkLayer[];
  onAddLayer: () => void;
  onRemoveLayer: (index: number) => void;
  onUpdateLayer: (index: number, neurons: number, activation: ActivationType) => void;
  
  learningRate: number;
  onLearningRateChange: (lr: number) => void;
  regularization: number;
  onRegularizationChange: (reg: number) => void;
  
  isTraining: boolean;
  onStart: () => void;
  onPause: () => void;
  onStep: () => void;
  onReset: () => void;
  onRegenerateData: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  datasetType, onDatasetChange,
  noise, onNoiseChange,
  trainRatio, onTrainRatioChange,
  layers, onAddLayer, onRemoveLayer, onUpdateLayer,
  learningRate, onLearningRateChange,
  regularization, onRegularizationChange,
  isTraining, onStart, onPause, onStep, onReset, onRegenerateData,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, background: '#ffffff', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div>
        <h3 style={{ margin: 0, marginBottom: 12, fontSize: 16, fontWeight: 600, color: '#1e293b' }}>📊 数据集</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#475569', marginBottom: 4 }}>数据集类型</label>
            <select 
              value={datasetType} 
              onChange={(e) => onDatasetChange(e.target.value as DatasetType)}
              style={{ width: '100%', padding: 6, borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
            >
              <option value="linear">线性可分</option>
              <option value="circle">同心圆</option>
              <option value="xor">异或（双月牙）</option>
              <option value="spiral">螺旋</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#475569', marginBottom: 4 }}>
              噪声: {noise.toFixed(2)}
            </label>
            <input 
              type="range" 
              min="0" 
              max="0.2" 
              step="0.01" 
              value={noise} 
              onChange={(e) => onNoiseChange(parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#475569', marginBottom: 4 }}>
              训练比例: {(trainRatio * 100).toFixed(0)}%
            </label>
            <input 
              type="range" 
              min="0.5" 
              max="0.9" 
              step="0.05" 
              value={trainRatio} 
              onChange={(e) => onTrainRatioChange(parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
          <button 
            onClick={onRegenerateData}
            style={{ 
              padding: '6px 12px', 
              borderRadius: 6, 
              border: '1px solid #cbd5e1', 
              background: '#f8fafc',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            🔄 重新生成数据
          </button>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
        <h3 style={{ margin: 0, marginBottom: 12, fontSize: 16, fontWeight: 600, color: '#1e293b' }}>🧠 网络结构</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {layers.map((layer, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 8, background: '#f1f5f9', borderRadius: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: '#64748b', minWidth: 50 }}>隐藏层 {index + 1}</span>
              <input 
                type="number" 
                min="1" 
                max="16" 
                value={layer.neurons} 
                onChange={(e) => onUpdateLayer(index, Math.max(1, Math.min(16, parseInt(e.target.value) || 1)), layer.activation)}
                style={{ width: 50, padding: 4, borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12 }}
              />
              <select 
                value={layer.activation} 
                onChange={(e) => onUpdateLayer(index, layer.neurons, e.target.value as ActivationType)}
                style={{ flex: 1, padding: 4, borderRadius: 4, border: '1px solid #cbd5e1', fontSize: 12 }}
              >
                <option value="relu">ReLU</option>
                <option value="tanh">Tanh</option>
                <option value="sigmoid">Sigmoid</option>
              </select>
              {layers.length > 1 && (
                <button 
                  onClick={() => onRemoveLayer(index)}
                  style={{ 
                    padding: '4px 8px', 
                    borderRadius: 4, 
                    border: 'none', 
                    background: '#fee2e2',
                    color: '#dc2626',
                    cursor: 'pointer',
                    fontSize: 11,
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button 
            onClick={onAddLayer}
            style={{ 
              padding: '6px 12px', 
              borderRadius: 6, 
              border: '1px dashed #94a3b8', 
              background: 'transparent',
              cursor: 'pointer',
              fontSize: 12,
              color: '#64748b',
            }}
          >
            + 添加隐藏层
          </button>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
        <h3 style={{ margin: 0, marginBottom: 12, fontSize: 16, fontWeight: 600, color: '#1e293b' }}>⚙️ 超参数</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#475569', marginBottom: 4 }}>
              学习率: {learningRate.toFixed(3)}
            </label>
            <input 
              type="range" 
              min="0.001" 
              max="0.5" 
              step="0.001" 
              value={learningRate} 
              onChange={(e) => onLearningRateChange(parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#475569', marginBottom: 4 }}>
              L2 正则化: {regularization.toFixed(4)}
            </label>
            <input 
              type="range" 
              min="0" 
              max="0.01" 
              step="0.0001" 
              value={regularization} 
              onChange={(e) => onRegularizationChange(parseFloat(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
        <h3 style={{ margin: 0, marginBottom: 12, fontSize: 16, fontWeight: 600, color: '#1e293b' }}>🎮 训练控制</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {!isTraining ? (
            <button 
              onClick={onStart}
              style={{ 
                padding: '10px 16px', 
                borderRadius: 8, 
                border: 'none', 
                background: '#22c55e',
                color: 'white',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              ▶ 开始
            </button>
          ) : (
            <button 
              onClick={onPause}
              style={{ 
                padding: '10px 16px', 
                borderRadius: 8, 
                border: 'none', 
                background: '#f59e0b',
                color: 'white',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              ⏸ 暂停
            </button>
          )}
          <button 
            onClick={onStep}
            style={{ 
              padding: '10px 16px', 
              borderRadius: 8, 
              border: '1px solid #cbd5e1', 
              background: '#ffffff',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            ⏭ 单步
          </button>
          <button 
            onClick={onReset}
            style={{ 
              gridColumn: '1 / -1',
              padding: '10px 16px', 
              borderRadius: 8, 
              border: '1px solid #cbd5e1', 
              background: '#f8fafc',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            🔄 重置网络
          </button>
        </div>
      </div>
    </div>
  );
};
