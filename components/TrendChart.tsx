
import React, { useMemo } from 'react';
import * as d3 from 'd3-scale';

interface TrendChartProps {
  countryCode: string;
  currentYear: number;
  currentGdp: number;
  growthRate: number;
}

const TrendChart: React.FC<TrendChartProps> = ({ countryCode, currentYear, currentGdp, growthRate }) => {
  // Generate synthetic trend data based on current snapshot + growth rate
  // In a real app, this would come from the API historical data
  const data = useMemo(() => {
    const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028];
    const baseGdp = currentGdp;
    
    return years.map(year => {
      const diff = year - currentYear;
      // Simple compound projection/historical estimation
      // Add some noise based on year parity to make it look less linear
      const noise = (year % 2 === 0 ? 0.5 : -0.3); 
      const rate = (growthRate + noise) / 100;
      
      let val = baseGdp * Math.pow(1 + rate, diff);
      // Ensure positive
      val = Math.max(10, val);
      
      return { year, value: val, isProjected: year >= 2026 };
    });
  }, [currentYear, currentGdp, growthRate]);

  const width = 350;
  const height = 120;
  const padding = 20;

  const xScale = d3.scaleLinear()
    .domain([2020, 2028])
    .range([padding, width - padding]);

  const minVal = Math.min(...data.map(d => d.value));
  const maxVal = Math.max(...data.map(d => d.value));

  const yScale = d3.scaleLinear()
    .domain([minVal * 0.9, maxVal * 1.1])
    .range([height - padding, padding]);

  // Split data into solid (<=2025) and dashed (>=2025) segments
  // We include 2025 in both to connect the lines
  const solidData = data.filter(d => d.year <= 2025);
  const dashedData = data.filter(d => d.year >= 2025);

  const createPath = (points: typeof data) => {
    if (points.length === 0) return "";
    let path = `M ${xScale(points[0].year)} ${yScale(points[0].value)}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${xScale(points[i].year)} ${yScale(points[i].value)}`;
    }
    return path;
  };

  return (
    <div className="w-full bg-white/5 rounded-xl border border-white/10 p-4">
      <h4 className="text-xs uppercase tracking-widest text-white/50 mb-4">GDP Trend (2020-2028)</h4>
      <div className="relative w-full flex justify-center">
        <svg width={width} height={height} className="overflow-visible">
          {/* Grid lines */}
          {[2020, 2022, 2024, 2026, 2028].map(year => (
            <g key={year}>
              <line 
                x1={xScale(year)} 
                y1={padding} 
                x2={xScale(year)} 
                y2={height - padding} 
                stroke="rgba(255,255,255,0.05)" 
                strokeWidth="1" 
              />
              <text 
                x={xScale(year)} 
                y={height} 
                fill="rgba(255,255,255,0.3)" 
                fontSize="10" 
                textAnchor="middle"
              >
                {year}
              </text>
            </g>
          ))}

          {/* Solid Line (Historical + Near Future) */}
          <path
            d={createPath(solidData)}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Dashed Line (Projections 2026+) */}
          <path
            d={createPath(dashedData)}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeDasharray="4 4"
            strokeOpacity="0.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {data.map((d) => (
            <circle
              key={d.year}
              cx={xScale(d.year)}
              cy={yScale(d.value)}
              r={d.year === currentYear ? 4 : 2}
              fill={d.year === currentYear ? "#fff" : "#3b82f6"}
              stroke={d.year === currentYear ? "#3b82f6" : "none"}
              strokeWidth={2}
            />
          ))}
        </svg>
      </div>
    </div>
  );
};

export default TrendChart;
