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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          setRawData(parsedRawData);
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

  useEffect(() => {
    if (rawData.length > 0) {
      const parsed = rawData.map(([x, y], index) => ({
        x,
        y,
        pointNumber: index + 1,
      }));
      setParsedData(parsed);
    } else {
      setParsedData([]);
    }
  }, [rawData]);

  const fetchByPoint = (pointNumber) => {
    const newIndex = Math.min(pointNumber - 1, maxFrames - 1);
    setCurrentIndexLeft(newIndex);
    setCurrentIndexRight(newIndex);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { pointNumber, x, y } = payload[0].payload;
      return React.createElement(
        "div",
        {
          style: {
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            padding: "5px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          },
        },
        React.createElement("p", null, `Point: ${pointNumber}`),
        React.createElement("p", null, `X: ${x}`),
        React.createElement("p", null, `Y: ${y}`)
      );
    }
    return null;
  };

  if (loading) {
    return React.createElement("div", null, "Loading data...");
  }

  if (error) {
    return React.createElement("div", null, error);
  }

  const centerX = parsedData.reduce((acc, point) => acc + point.x, 0) / parsedData.length;
  const centerY = parsedData.reduce((acc, point) => acc + point.y, 0) / parsedData.length;
  const centeredData = [{ x: centerX, y: centerY, pointNumber: 0 }, ...parsedData];

  return React.createElement(
    "div",
    { style: { width: "100%", height: "400px", marginTop: "30px" } },
    React.createElement("h1", null, "Floor Map"),
    React.createElement(
      ResponsiveContainer,
      { width: "100%", height: "100%" },
      React.createElement(
        ScatterChart,
        { margin: { top: 30, right: 20, bottom: 30, left: 30 } },
        React.createElement(CartesianGrid, { strokeDasharray: "3 3" }),
        React.createElement(XAxis, {
          dataKey: "x",
          type: "number",
          domain: ["auto", "auto"],
          hide: true,
        }),
        React.createElement(YAxis, {
          dataKey: "y",
          type: "number",
          domain: ["auto", "auto"],
          hide: true,
        }),
        React.createElement(Tooltip, { content: React.createElement(CustomTooltip), cursor: false }),
        React.createElement(Line, {
          type: "monotone",
          data: centeredData,
          dataKey: "y",
          stroke: "#8884d8",
          dot: { r: 6, fill: "#8884d8" },
          connectNulls: true,
          isAnimationActive: false,
        }),
        React.createElement(Scatter, {
          data: parsedData,
          fill: "#8884d8",
          shape: "circle",
          radius: 6,
          onClick: (e) => fetchByPoint(e.payload.pointNumber),
        })
      )
    )
  );
};

export default LineGraph;
