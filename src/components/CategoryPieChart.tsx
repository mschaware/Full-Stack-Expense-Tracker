import { useEffect, useState } from 'react';
import { PieChart } from 'lucide-react';

interface CategoryData {
  category: string;
  total: number;
  percentage: number;
  color: string;
}

interface CategoryPieChartProps {
  data: { category: string; total: number }[];
}

const COLORS = [
  '#10b981',
  '#3b82f6',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#84cc16',
  '#f97316',
  '#6366f1',
];

export default function CategoryPieChart({ data }: CategoryPieChartProps) {
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const total = data.reduce((sum, item) => sum + item.total, 0);

    const processed = data.map((item, index) => ({
      category: item.category,
      total: item.total,
      percentage: (item.total / total) * 100,
      color: COLORS[index % COLORS.length],
    }));

    setCategoryData(processed);
  }, [data]);

  if (categoryData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
          <PieChart className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2">No data to display</h3>
        <p className="text-slate-500">Add some expenses to see the category distribution.</p>
      </div>
    );
  }

  const totalAmount = categoryData.reduce((sum, item) => sum + item.total, 0);

  let cumulativePercentage = 0;
  const segments = categoryData.map((item) => {
    const startAngle = (cumulativePercentage / 100) * 360;
    cumulativePercentage += item.percentage;
    const endAngle = (cumulativePercentage / 100) * 360;

    return {
      ...item,
      startAngle,
      endAngle,
    };
  });

  const createArcPath = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(200, 200, 150, endAngle);
    const end = polarToCartesian(200, 200, 150, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return [
      'M', 200, 200,
      'L', start.x, start.y,
      'A', 150, 150, 0, largeArcFlag, 0, end.x, end.y,
      'Z'
    ].join(' ');
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Category Distribution</h2>

      <div className="flex flex-col lg:flex-row items-center gap-8">
        <div className="relative w-full max-w-md aspect-square">
          <svg viewBox="0 0 400 400" className="w-full h-full">
            {segments.map((segment, index) => (
              <g key={segment.category}>
                <path
                  d={createArcPath(segment.startAngle, segment.endAngle)}
                  fill={segment.color}
                  className="transition-all duration-300 cursor-pointer"
                  style={{
                    opacity: hoveredIndex === null || hoveredIndex === index ? 1 : 0.5,
                    transform: hoveredIndex === index ? 'scale(1.02)' : 'scale(1)',
                    transformOrigin: '200px 200px',
                  }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              </g>
            ))}
            <circle cx="200" cy="200" r="80" fill="white" />
            <text
              x="200"
              y="190"
              textAnchor="middle"
              className="text-3xl font-bold fill-slate-800"
            >
              ${totalAmount.toFixed(0)}
            </text>
            <text
              x="200"
              y="215"
              textAnchor="middle"
              className="text-sm fill-slate-500"
            >
              Total
            </text>
          </svg>
        </div>

        <div className="flex-1 w-full space-y-3">
          {categoryData.map((item, index) => (
            <div
              key={item.category}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition cursor-pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                backgroundColor: hoveredIndex === index ? 'rgba(0,0,0,0.02)' : 'transparent',
              }}
            >
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-medium text-slate-800 truncate">{item.category}</span>
                  <span className="text-sm font-semibold text-slate-600">
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-slate-800 whitespace-nowrap">
                    ${item.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
