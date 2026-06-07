import React, { useMemo } from 'react';

interface NetworkVisualizerProps {
  layerSizes: number[];
  weights: number[][][];
}

export const NetworkVisualizer: React.FC<NetworkVisualizerProps> = ({ layerSizes, weights }) => {
  const width = 280;
  const height = 350;
  const layerGap = width / (layerSizes.length + 1);
  
  const maxNeurons = Math.max(...layerSizes);
  const neuronGap = height / (maxNeurons + 2);
  const neuronRadius = Math.min(12, neuronGap * 0.35);

  const nodePositions = useMemo(() => {
    const positions: { x: number; y: number }[][] = [];
    for (let l = 0; l < layerSizes.length; l++) {
      const layerPos: { x: number; y: number }[] = [];
      const x = layerGap * (l + 1);
      const n = layerSizes[l];
      const startY = (height - (n - 1) * neuronGap) / 2;
      for (let i = 0; i < n; i++) {
        layerPos.push({ x, y: startY + i * neuronGap });
      }
      positions.push(layerPos);
    }
    return positions;
  }, [layerSizes, layerGap, neuronGap, height]);

  const getWeightColor = (w: number): string => {
    if (w > 0) {
      const intensity = Math.min(1, Math.abs(w) / 2);
      return `rgba(59, 130, 246, ${intensity})`;
    } else {
      const intensity = Math.min(1, Math.abs(w) / 2);
      return `rgba(239, 68, 68, ${intensity})`;
    }
  };

  const getWeightWidth = (w: number): number => {
    return 0.5 + Math.min(3, Math.abs(w) * 1.5);
  };

  return (
    <svg width={width} height={height} style={{ background: '#f8fafc', borderRadius: 8 }}>
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {weights.map((layerWeights, l) =>
        layerWeights.map((neuronWeights, j) =>
          neuronWeights.map((w, k) => {
            const from = nodePositions[l][k];
            const to = nodePositions[l + 1][j];
            return (
              <line
                key={`${l}-${k}-${j}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={getWeightColor(w)}
                strokeWidth={getWeightWidth(w)}
                strokeLinecap="round"
              />
            );
          })
        )
      )}
      
      {nodePositions.map((layer, l) =>
        layer.map((pos, i) => (
          <g key={`node-${l}-${i}`}>
            <circle
              cx={pos.x}
              cy={pos.y}
              r={neuronRadius}
              fill="#ffffff"
              stroke="#334155"
              strokeWidth={2}
              filter="url(#glow)"
            />
            <circle
              cx={pos.x}
              cy={pos.y}
              r={neuronRadius * 0.5}
              fill={l === 0 ? (i === 0 ? '#f59e0b' : '#8b5cf6') : l === layerSizes.length - 1 ? '#10b981' : '#64748b'}
              opacity={0.8}
            />
          </g>
        ))
      )}
      
      {nodePositions.map((layer, l) =>
        l === 0 ? (
          <g key={`label-${l}`}>
            <text x={layer[0].x} y={layer[0].y - neuronRadius - 5} textAnchor="middle" fontSize={10} fill="#64748b">x₁</text>
            <text x={layer[1].x} y={layer[1].y - neuronRadius - 5} textAnchor="middle" fontSize={10} fill="#64748b">x₂</text>
          </g>
        ) : l === layerSizes.length - 1 ? (
          <text key={`label-${l}`} x={layer[0].x} y={layer[0].y - neuronRadius - 5} textAnchor="middle" fontSize={10} fill="#64748b">ŷ</text>
        ) : null
      )}
    </svg>
  );
};
