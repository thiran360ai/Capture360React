import React, { useEffect, useState } from "react";
import {
  ScatterChart,
  Scatter,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const LineGraph = ({ setCurrentIndexLeft, setCurrentIndexRight, maxFrames, id }) => {
  const [rawData, setRawData] = useState([]);
  const [parsedData, setParsedData] = useState([]);
  const [loading, setLoading] = useState(true); // For loading state
  const [error, setError] = useState(null); // For error state

  // Fetch data from backend on component mount
  useEffect(() => {
    const fetchFloorData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://api.capture360.ai/building/getFloorPlan/${id}/`,
          {
            headers: {
              Accept: "application/json",
              
            },
          }
        );
        const res_data = await response.json();

        if (res_data && res_data[0]?.data) {
          const parsedRawData = JSON.parse(res_data[0].data);
          setRawData(parsedRawData); // Set the fetched data to the state
        } else {
          setError("No data found for this floor.");
        }
      } catch (error) {
        setError("Failed to fetch floor data. Please try again later.");
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFloorData();
  }, [id]);

  // Parse and format the data into an array of objects with x, y, and pointNumber properties
  useEffect(() => {
    if (rawData.length > 0) {
      const parsed = rawData.map(([x, y], index) => ({
        x, // x-axis value
        y, // y-axis value
        pointNumber: index + 1, // Consecutive point number
      }));
      setParsedData(parsed); // Update state with the parsed data
    } else {
      setParsedData([]); // If no rawData, set parsedData to an empty array
    }
  }, [rawData]);

  // Handle point click event (set the index in parent component)
  const fetchByPoint = (pointNumber) => {
    const newIndex = Math.min(pointNumber - 1, maxFrames - 1);
    setCurrentIndexLeft(newIndex);
    setCurrentIndexRight(newIndex);
  };

  // Custom Tooltip to display point numbers
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { pointNumber, x, y } = payload[0].payload;
      return (
        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            padding: "5px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        >
          <p>Point: {pointNumber}</p>
          <p>X: {x}</p>
          <p>Y: {y}</p>
        </div>
      );
    }
    return null;
  };

  // Loading and Error Handling UI
  if (loading) {
    return <div>Loading data...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  // Calculate center of the data (the midpoint of x and y values)
  const centerX = parsedData.reduce((acc, point) => acc + point.x, 0) / parsedData.length;
  const centerY = parsedData.reduce((acc, point) => acc + point.y, 0) / parsedData.length;

  // Add center point if needed (optional)
  const centeredData = [{ x: centerX, y: centerY, pointNumber: 0 }, ...parsedData];

  return (
    <div style={{ width: "100%", height: "400px", marginTop: "30px" }}>
      <h1>Floor Map</h1>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{ top: 30, right: 20, bottom: 30, left: 30 }}
        >
          {/* Cartesian Grid to make the visualization grid-like */}
          <CartesianGrid strokeDasharray="3 3" />

          {/* X and Y Axes with no labels */}
          <XAxis
            dataKey="x"
            type="number"
            domain={["auto", "auto"]}
            hide={true}
          />
          <YAxis
            dataKey="y"
            type="number"
            domain={["auto", "auto"]}
            hide={true}
          />

          {/* Custom Tooltip to show additional data */}
          <Tooltip content={<CustomTooltip />} cursor={false} />

          {/* Line to connect the points with dots on each point */}
          <Line
            type="monotone"
            data={centeredData} // Use centeredData to start from the center
            dataKey="y"
            stroke="#8884d8"
            dot={{ r: 6, fill: "#8884d8" }} // Show dots on the line
            connectNulls={true}
            isAnimationActive={false} // Disable animation for faster rendering
          />

          {/* Scatter plot for individual points */}
          <Scatter
            data={parsedData}
            fill="#8884d8"
            shape="circle"
            radius={6}
            onClick={(e) => fetchByPoint(e.payload.pointNumber)}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineGraph;