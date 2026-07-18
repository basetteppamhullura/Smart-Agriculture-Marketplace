import React, { useState } from 'react';

export default function AnalyticsChart({ data = [], type = 'line', height = 220 }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!data || data.length === 0) {
    return <div style={styles.empty}>No chart data available</div>;
  }

  // Calculate scales
  const chartHeight = height - 40;
  const padding = 30;
  const graphHeight = chartHeight - padding;

  const maxVal = Math.max(
    ...data.flatMap(d => [d.revenue || 0, d.expenses || 0, d.value || 0])
  ) || 100;

  const getCoordinates = () => {
    const points = [];
    const step = 100 / (data.length - 1 || 1);
    
    data.forEach((d, idx) => {
      const x = padding + (idx * step * 0.85 * (300 / 100));
      const val = d.value || d.revenue || 0;
      const y = chartHeight - padding - ((val / maxVal) * graphHeight);
      points.push({ x, y, label: d.label || d.month, val });
    });
    return points;
  };

  const renderLineChart = () => {
    const points = getCoordinates();
    if (points.length === 0) return null;

    // Build line path d attribute
    let linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      linePath += ` L ${points[i].x} ${points[i].y}`;
    }

    // Build closed area path for gradient fill
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`;

    return (
      <svg width="100%" height={height} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const y = chartHeight - padding - (ratio * graphHeight);
          return (
            <line 
              key={idx} 
              x1={padding} 
              y1={y} 
              x2="95%" 
              y2={y} 
              stroke="var(--border-color)" 
              strokeDasharray="4 4" 
            />
          );
        })}

        {/* Gradient Area */}
        <path d={areaPath} fill="url(#chartGrad)" />

        {/* Highlight line */}
        <path d={linePath} fill="none" stroke="var(--emerald)" strokeWidth="3" />

        {/* Interactive Data points */}
        {points.map((p, idx) => (
          <g key={idx}>
            <circle
              cx={p.x}
              cy={p.y}
              r={hoveredIdx === idx ? 7 : 4}
              fill="var(--bg-secondary)"
              stroke="var(--emerald)"
              strokeWidth="3"
              style={{ cursor: 'pointer', transition: 'r 0.2s' }}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
            {/* Value tooltip */}
            {hoveredIdx === idx && (
              <g>
                <rect 
                  x={p.x - 45} 
                  y={p.y - 35} 
                  width="90" 
                  height="25" 
                  rx="4" 
                  fill="var(--text-primary)" 
                />
                <text 
                  x={p.x} 
                  y={p.y - 18} 
                  fill="var(--bg-secondary)" 
                  fontSize="11" 
                  fontWeight="bold" 
                  textAnchor="middle"
                >
                  Rs {p.val.toLocaleString()}
                </text>
              </g>
            )}
            {/* Label */}
            <text 
              x={p.x} 
              y={chartHeight - 5} 
              fill="var(--text-secondary)" 
              fontSize="11" 
              fontWeight="600" 
              textAnchor="middle"
            >
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    );
  };

  const renderBarChart = () => {
    const totalBars = data.length;
    const containerWidth = 400; // estimated SVG width reference
    const groupWidth = 60;
    const barWidth = 18;
    const spacing = 15;

    return (
      <svg width="100%" height={height} style={{ overflow: 'visible' }}>
        {/* Horizontal Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const y = chartHeight - padding - (ratio * graphHeight);
          return (
            <line 
              key={idx} 
              x1={padding} 
              y1={y} 
              x2="95%" 
              y2={y} 
              stroke="var(--border-color)" 
              strokeDasharray="4 4" 
            />
          );
        })}

        {data.map((d, idx) => {
          const x = padding + idx * (groupWidth + spacing);
          const revVal = d.revenue || 0;
          const expVal = d.expenses || 0;

          const revY = chartHeight - padding - ((revVal / maxVal) * graphHeight);
          const revH = ((revVal / maxVal) * graphHeight);

          const expY = chartHeight - padding - ((expVal / maxVal) * graphHeight);
          const expH = ((expVal / maxVal) * graphHeight);

          return (
            <g key={idx}>
              {/* Revenue Bar */}
              <rect
                x={x}
                y={revY}
                width={barWidth}
                height={revH}
                fill="var(--forest-green)"
                rx="3"
                className="bar-chart-bar"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredIdx(`rev_${idx}`)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
              {hoveredIdx === `rev_${idx}` && (
                <g>
                  <rect x={x - 20} y={revY - 30} width="60" height="22" rx="4" fill="var(--text-primary)" />
                  <text x={x + 10} y={revY - 15} fill="var(--bg-secondary)" fontSize="10" fontWeight="700" textAnchor="middle">
                    Rs {revVal}
                  </text>
                </g>
              )}

              {/* Expenses Bar */}
              <rect
                x={x + barWidth + 4}
                y={expY}
                width={barWidth}
                height={expH}
                fill="#ef4444"
                rx="3"
                style={{ cursor: 'pointer', opacity: 0.85 }}
                onMouseEnter={() => setHoveredIdx(`exp_${idx}`)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
              {hoveredIdx === `exp_${idx}` && (
                <g>
                  <rect x={x + 5} y={expY - 30} width="60" height="22" rx="4" fill="var(--text-primary)" />
                  <text x={x + 35} y={expY - 15} fill="var(--bg-secondary)" fontSize="10" fontWeight="700" textAnchor="middle">
                    Rs {expVal}
                  </text>
                </g>
              )}

              {/* Label */}
              <text
                x={x + barWidth}
                y={chartHeight - 5}
                fill="var(--text-secondary)"
                fontSize="11"
                fontWeight="600"
                textAnchor="middle"
              >
                {d.label || d.month}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div style={styles.wrapper}>
      {type === 'line' ? renderLineChart() : renderBarChart()}
    </div>
  );
}

const styles = {
  wrapper: {
    padding: '10px 0',
    width: '100%',
    display: 'flex',
    justifyContent: 'center'
  },
  empty: {
    height: '150px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-secondary)',
    fontSize: '14px',
    border: '1px dashed var(--border-color)',
    borderRadius: '8px'
  }
};
