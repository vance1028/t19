import React, { useRef, useEffect } from 'react';
import { DataPoint } from '../types';
import { NeuralNetwork } from '../neuralNetwork';

interface DecisionBoundaryProps {
  network: NeuralNetwork | null;
  trainData: DataPoint[];
  testData: DataPoint[];
}

export const DecisionBoundary: React.FC<DecisionBoundaryProps> = ({ network, trainData, testData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const resolution = 60;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    if (network) {
      const imageData = ctx.createImageData(width, height);
      const data = imageData.data;
      
      const xMin = -1.2;
      const xMax = 1.2;
      const yMin = -1.2;
      const yMax = 1.2;
      
      for (let py = 0; py < height; py++) {
        for (let px = 0; px < width; px++) {
          const x = xMin + (xMax - xMin) * (px / width);
          const y = yMin + (yMax - yMin) * (py / height);
          
          const pred = network.forward([x, y]);
          
          const idx = (py * width + px) * 4;
          
          if (pred >= 0.5) {
            const intensity = Math.floor(150 + (pred - 0.5) * 2 * 105);
            data[idx] = 59;
            data[idx + 1] = 130;
            data[idx + 2] = Math.min(255, intensity);
          } else {
            const intensity = Math.floor(150 + (0.5 - pred) * 2 * 105);
            data[idx] = Math.min(255, intensity);
            data[idx + 1] = 68;
            data[idx + 2] = 68;
          }
          data[idx + 3] = 100;
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
    }
    
    const allData = [...trainData.map(d => ({ ...d, isTrain: true })), ...testData.map(d => ({ ...d, isTrain: false }))];
    
    for (const point of allData) {
      const px = ((point.x + 1.2) / 2.4) * width;
      const py = ((point.y + 1.2) / 2.4) * height;
      
      ctx.beginPath();
      ctx.arc(px, py, point.isTrain ? 5 : 4, 0, Math.PI * 2);
      ctx.fillStyle = point.label === 1 ? '#3b82f6' : '#ef4444';
      ctx.fill();
      ctx.strokeStyle = point.isTrain ? '#ffffff' : '#e2e8f0';
      ctx.lineWidth = point.isTrain ? 2 : 1.5;
      ctx.stroke();
    }
    
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, width, height);
    
  }, [network, trainData, testData]);

  return (
    <div style={{ position: 'relative', width: '100%', paddingBottom: '100%' }}>
      <canvas
        ref={canvasRef}
        width={resolution}
        height={resolution}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          borderRadius: 8,
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
};
