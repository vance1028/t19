import { DataPoint, DatasetType } from './types';

function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function addNoise(points: DataPoint[], noiseLevel: number): DataPoint[] {
  return points.map(p => ({
    x: p.x + (Math.random() * 2 - 1) * noiseLevel,
    y: p.y + (Math.random() * 2 - 1) * noiseLevel,
    label: p.label,
  }));
}

function generateLinear(count: number, noise: number): DataPoint[] {
  const points: DataPoint[] = [];
  const half = Math.floor(count / 2);
  
  for (let i = 0; i < half; i++) {
    const x = Math.random() * 2 - 1;
    const y = Math.random() * 2 - 1;
    const label = x + y > 0 ? 1 : 0;
    points.push({ x, y, label });
  }
  
  for (let i = 0; i < count - half; i++) {
    const x = Math.random() * 2 - 1;
    const y = Math.random() * 2 - 1;
    const label = x + y > 0 ? 1 : 0;
    points.push({ x, y, label });
  }
  
  return addNoise(shuffleArray(points), noise);
}

function generateCircle(count: number, noise: number): DataPoint[] {
  const points: DataPoint[] = [];
  const half = Math.floor(count / 2);
  const innerRadius = 0.3;
  const outerRadius = 0.7;
  
  for (let i = 0; i < half; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = innerRadius * (0.7 + Math.random() * 0.3);
    points.push({
      x: Math.cos(angle) * r,
      y: Math.sin(angle) * r,
      label: 0,
    });
  }
  
  for (let i = 0; i < count - half; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = outerRadius * (0.85 + Math.random() * 0.15);
    points.push({
      x: Math.cos(angle) * r,
      y: Math.sin(angle) * r,
      label: 1,
    });
  }
  
  return addNoise(shuffleArray(points), noise);
}

function generateXOR(count: number, noise: number): DataPoint[] {
  const points: DataPoint[] = [];
  const quarter = Math.floor(count / 4);
  
  for (let i = 0; i < quarter; i++) {
    points.push({ x: Math.random() * 0.4 + 0.3, y: Math.random() * 0.4 + 0.3, label: 1 });
  }
  for (let i = 0; i < quarter; i++) {
    points.push({ x: Math.random() * 0.4 - 0.7, y: Math.random() * 0.4 - 0.7, label: 1 });
  }
  for (let i = 0; i < quarter; i++) {
    points.push({ x: Math.random() * 0.4 + 0.3, y: Math.random() * 0.4 - 0.7, label: 0 });
  }
  for (let i = 0; i < count - 3 * quarter; i++) {
    points.push({ x: Math.random() * 0.4 - 0.7, y: Math.random() * 0.4 + 0.3, label: 0 });
  }
  
  return addNoise(shuffleArray(points), noise);
}

function generateSpiral(count: number, noise: number): DataPoint[] {
  const points: DataPoint[] = [];
  const half = Math.floor(count / 2);
  
  for (let i = 0; i < half; i++) {
    const t = i / half * 4 * Math.PI;
    const r = 0.1 + t * 0.06;
    points.push({
      x: Math.cos(t) * r,
      y: Math.sin(t) * r,
      label: 0,
    });
  }
  
  for (let i = 0; i < count - half; i++) {
    const t = i / (count - half) * 4 * Math.PI + Math.PI;
    const r = 0.1 + t * 0.06;
    points.push({
      x: Math.cos(t) * r,
      y: Math.sin(t) * r,
      label: 1,
    });
  }
  
  return addNoise(shuffleArray(points), noise);
}

export function generateDataset(
  type: DatasetType,
  count: number = 200,
  noise: number = 0.05,
  trainRatio: number = 0.8
): { train: DataPoint[]; test: DataPoint[] } {
  let points: DataPoint[];
  
  switch (type) {
    case 'linear':
      points = generateLinear(count, noise);
      break;
    case 'circle':
      points = generateCircle(count, noise);
      break;
    case 'xor':
      points = generateXOR(count, noise);
      break;
    case 'spiral':
      points = generateSpiral(count, noise);
      break;
  }
  
  const splitIndex = Math.floor(points.length * trainRatio);
  return {
    train: points.slice(0, splitIndex),
    test: points.slice(splitIndex),
  };
}
