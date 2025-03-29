import React from "react";
import { 
  ScatterChart, 
  Scatter, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

// Updated LineGraph component to accept props
const LineGraph = ({ data, width, height, currentPosition, navPoints, currentNavPointIndex }) => {
  // Use the navigation points if provided, otherwise fall back to static data
  const pathData = navPoints && navPoints.length > 0 
    ? navPoints.map(point => ({ x: point.x, y: point.y })) 
    : [
        { x: 10, y: 20 },
        { x: 20, y: 30 },
        { x: 30, y: 40 },
        { x: 40, y: 50 },
        { x: 50, y: 60 },
        { x: 60, y: 70 },
        { x: 70, y: 80 },
        { x: 80, y: 90 },
      ];

  // Current user position as a data point
  const userPositionData = currentPosition ? [{ x: currentPosition.x, y: currentPosition.y }] : [];

  // Highlight the current navigation point
  const currentNavPoint = navPoints && currentNavPointIndex !== undefined && navPoints.length > 0
    ? [{ x: navPoints[currentNavPointIndex].x, y: navPoints[currentNavPointIndex].y }]
    : [];

  return (
    <div style={{ width: width || "100%", height: height || "400px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.3)" />
          <XAxis dataKey="x" type="number" domain={[0, 100]} hide />
          <YAxis dataKey="y" type="number" domain={[0, 100]} hide />
          
          {/* Dotted line for walking path */}
          <Line
            type="monotone"
            data={pathData}
            dataKey="y"
            stroke="#007BFF"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 4, fill: "#007BFF" }}
            connectNulls={true}
          />
          
          {/* Navigation points */}
          <Scatter 
            data={pathData} 
            fill="#007BFF" 
            shape="circle" 
            radius={3.5} 
          />
          
          {/* Current navigation point */}
          <Scatter 
            data={currentNavPoint} 
            fill="#FF5722" 
            shape="circle" 
            radius={5} 
          />
          
          {/* User position */}
          <Scatter 
            data={userPositionData} 
            fill="red" 
            shape="circle" 
            radius={4.5} 
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineGraph;
