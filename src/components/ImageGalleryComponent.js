import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Typography from "@mui/material/Typography";
import LineGraph from "./LineGraph";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import arrowimg from './arrow-icon-1182.png';
import * as THREE from 'three';
// Import a static floor map image (you'll need to add this file to your project)
import staticFloorMapImage from './static-floor-map.jpg';

const theme = createTheme();

const ImageGalleryComponent = () => {
  const location = useLocation();
  const { id } = location.state || {};
  const [imagesLeft, setImagesLeft] = useState([]);
  const [imagesRight, setImagesRight] = useState([]);
  const [currentIndexLeft, setCurrentIndexLeft] = useState(0);
  const [currentIndexRight, setCurrentIndexRight] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [dates, setDates] = useState([]);
  const [selectedDateLeft, setSelectedDateLeft] = useState("");
  const [selectedDateRight, setSelectedDateRight] = useState("");
  const [isSplitScreen, setIsSplitScreen] = useState(true);
  const [dateToIdMap, setDateToIdMap] = useState({});
  const [imageUrlLeft, setImageUrlLeft] = useState("");
  const [imageUrlRight, setImageUrlRight] = useState("");
  const [arrowDirection, setArrowDirection] = useState("up");
  const vrSceneRef = useRef(null);
  const [floorMapUrl, setFloorMapUrl] = useState("");
  const [floorMapRotation, setFloorMapRotation] = useState(0);
  const [userPosition, setUserPosition] = useState({ x: 50, y: 50 });
  const [jsonid, setJsonid] = useState();
  const [navPoints, setNavPoints] = useState([]);
  const [currentNavPointIndex, setCurrentNavPointIndex] = useState(0);
  const [cursorValues, setCursorValues] = useState({ x: 0, y: 0 });
  const [graphData, setGraphData] = useState(null);
  const [showGraphOnMap, setShowGraphOnMap] = useState(true);
  const [graphPoints, setGraphPoints] = useState([]);
  const [selectedPointIndex, setSelectedPointIndex] = useState(0);
  const [isGraphLoaded, setIsGraphLoaded] = useState(false);
  const [graphPointToImageMap, setGraphPointToImageMap] = useState({});

  useEffect(() => {
    if (id) {
      fetchDates(id);
      fetchFloorMap(id);
    } else {
      console.error("ID is undefined.");
    }
  }, [id]);

  useEffect(() => {
    if (!isPaused) {
      const intervalId = setInterval(() => {
        setCurrentIndexLeft((prevIndex) => (prevIndex + 1) % imagesLeft.length);
        setCurrentIndexRight((prevIndex) => (prevIndex + 1) % imagesRight.length);
      }, 3000);

      return () => clearInterval(intervalId);
    }
  }, [imagesLeft.length, imagesRight.length, isPaused]);

  const fetchFloorMap = async (buildingId) => {
    try {
      const response = await fetch(
        `https://api.capture360.ai/building/api/video-frames/plan/${buildingId}/`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.length > 0 && data[0].image) {
        setFloorMapUrl(`https://api.capture360.ai/${data[0].image}`);
        fetchNavigationPoints(buildingId, data[0].id);
      } else {
        console.warn("No floor map found for this building");
        // Set static floor map image when API doesn't return a floor map
        setFloorMapUrl(staticFloorMapImage);
      }
    } catch (error) {
      console.error("Failed to fetch floor map:", error);
      // Set static floor map image when API request fails
      setFloorMapUrl(staticFloorMapImage);
    }
  };
  
  const fetchGraphData = async (jsonId) => {
    if (!jsonId) return;
    
    try {
      const response = await fetch(
        `https://api.capture360.ai/building/api/graph-data/${jsonId}/`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setGraphData(data);
      
      // Also fetch floor plan data to get the actual points
      try {
        const floorPlanResponse = await fetch(
          `https://api.capture360.ai/building/getFloorPlan/${jsonId}/`,
          {
            headers: {
              Accept: "application/json",
            },
          }
        );
        
        if (floorPlanResponse.ok) {
          const floorData = await floorPlanResponse.json();
          if (floorData && floorData[0]?.data) {
            const parsedPoints = JSON.parse(floorData[0].data);
            
            // Create a map of point indexes to images
            const pointMap = {};
            if (imagesLeft.length > 0) {
              parsedPoints.forEach((_, index) => {
                const imageIndex = Math.min(index, imagesLeft.length - 1);
                pointMap[index] = imageIndex;
              });
              setGraphPointToImageMap(pointMap);
            }
            
            setGraphPoints(parsedPoints);
            setIsGraphLoaded(true);
          }
        }
      } catch (error) {
        console.error("Failed to fetch floor plan data:", error);
      }
    } catch (error) {
      console.error("Failed to fetch graph data:", error);
    }
  };

  const fetchNavigationPoints = async (buildingId, floorMapId) => {
    try {
      const response = await fetch(
        `https://api.capture360.ai/building/api/navigation-points/building/${buildingId}/floor/${floorMapId}/`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.length > 0) {
        const normalizedPoints = data.map(point => ({
          id: point.id,
          x: parseFloat(point.x_position),
          y: parseFloat(point.y_position),
          label: point.label || "",
          frameId: point.frame_id,
          videoId: point.video_id
        }));
        
        setNavPoints(normalizedPoints);
        
        if (normalizedPoints.length > 0) {
          setUserPosition({ 
            x: normalizedPoints[0].x, 
            y: normalizedPoints[0].y 
          });
          setCurrentNavPointIndex(0);
        }
      } else {
        console.warn("No navigation points found for this floor map");
        setUserPosition({ x: 50, y: 50 });
      }
    } catch (error) {
      console.error("Failed to fetch navigation points:", error);
      setUserPosition({ x: 50, y: 50 });
    }
  };

  const fetchImages = async (id, date, isRight) => {
    try {
      const frameId = dateToIdMap[date];
      if (!frameId) {
        console.error("No frame ID found for the selected date.");
        isRight ? setImagesRight([]) : setImagesLeft([]);
        return;
      }

      const response = await fetch(
        `https://api.capture360.ai/building/api/video-frames/plan/${id}/video/${frameId}/`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const imageData = await response.json();
      const jsonIdValue = imageData[0]?.json;
      setJsonid(jsonIdValue);
      
      // Fetch graph data when jsonid changes
      if (jsonIdValue) {
        fetchGraphData(jsonIdValue);
      }
      
      if (Array.isArray(imageData)) {
        const validImages = imageData.filter(
          (image) => image && image.image
        );
        
        const imagesWithNavData = validImages.map((image, index) => {
          const matchingNavPoint = navPoints.find(point => 
            point.frameId === image.id || 
            point.videoId === frameId
          );
          
          if (matchingNavPoint) {
            return {
              ...image,
              navPoint: {
                x: matchingNavPoint.x,
                y: matchingNavPoint.y,
                label: matchingNavPoint.label
              }
            };
          }
          return image;
        });
        
        if (isRight) {
          setImagesRight(imagesWithNavData);
          setCurrentIndexRight(0);
          setImageUrlRight(imagesWithNavData[0]?.image ? `https://api.capture360.ai/${imagesWithNavData[0].image}` : "");
          
          if (imagesWithNavData[0]?.navPoint) {
            setUserPosition({
              x: imagesWithNavData[0].navPoint.x,
              y: imagesWithNavData[0].navPoint.y
            });
          }
        } else {
          setImagesLeft(imagesWithNavData);
          setCurrentIndexLeft(0);
          setImageUrlLeft(imagesWithNavData[0]?.image ? `https://api.capture360.ai/${imagesWithNavData[0].image}` : "");
          
          if (imagesWithNavData[0]?.navPoint) {
            setUserPosition({
              x: imagesWithNavData[0].navPoint.x,
              y: imagesWithNavData[0].navPoint.y
            });
          }
        }
        
        // After loading images, update the graph point to image mapping
        if (graphPoints.length > 0) {
          const pointMap = {};
          graphPoints.forEach((_, index) => {
            const imageIndex = Math.min(index, validImages.length - 1);
            pointMap[index] = imageIndex;
          });
          setGraphPointToImageMap(pointMap);
        }
      } else {
        console.warn("Unexpected API response structure:", imageData);
        isRight ? setImagesRight([]) : setImagesLeft([]);
      }
    } catch (error) {
      console.error("Failed to fetch images:", error);
      isRight ? setImagesRight([]) : setImagesLeft([]);
    }
  };
  
  const fetchDates = async (id) => {
    try {
      const response = await fetch(
        `https://api.capture360.ai/building/api/video-frames/plan/${id}/`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.video_uploads) {
        const dateList = data.video_uploads.map((frame) => ({
          date: frame.upload_date || "Unknown",
          frameId: frame.id
        }));

        const dateMap = {};
        dateList.forEach(({ date, frameId }) => {
          dateMap[date] = frameId;
        });

        setDates(dateList.map(({ date }) => date));
        setDateToIdMap(dateMap);

        if (dateList.length > 0) {
          const firstDate = dateList[0].date;
          setSelectedDateLeft(firstDate);
          setSelectedDateRight(firstDate);
          fetchImages(id, firstDate, false);
          fetchImages(id, firstDate, true);
        }
      } else {
        console.warn("Unexpected API response structure:", data);
      }
    } catch (error) {
      console.error("Failed to fetch dates:", error);
    }
  };

  const handleDateChangeLeft = (event) => {
    const newDate = event.target.value;
    setSelectedDateLeft(newDate);
    fetchImages(id, newDate, false);
  };

  const handleDateChangeRight = (event) => {
    const newDate = event.target.value;
    setSelectedDateRight(newDate);
    fetchImages(id, newDate, true);
  };

  const handleNextLeft = () => {
    const nextLeftIndex = (currentIndexLeft + 1) % imagesLeft.length;
    const nextRightIndex = (currentIndexRight + 1) % imagesRight.length;
    
    setCurrentIndexLeft(nextLeftIndex);
    setCurrentIndexRight(nextRightIndex);
    
    if (imagesLeft[nextLeftIndex]?.navPoint) {
      setUserPosition({
        x: imagesLeft[nextLeftIndex].navPoint.x,
        y: imagesLeft[nextLeftIndex].navPoint.y
      });
    } else if (navPoints.length > 0) {
      const nextPointIndex = (currentNavPointIndex + 1) % navPoints.length;
      setUserPosition({
        x: navPoints[nextPointIndex].x,
        y: navPoints[nextPointIndex].y
      });
      setCurrentNavPointIndex(nextPointIndex);
    }
    
    // Update selected point in graph if we have graph data
    if (graphPoints.length > 0) {
      setSelectedPointIndex(nextLeftIndex % graphPoints.length);
    }
  };

  const handlePrevLeft = () => {
    const prevLeftIndex = (currentIndexLeft - 1 + imagesLeft.length) % imagesLeft.length;
    const prevRightIndex = (currentIndexRight - 1 + imagesRight.length) % imagesRight.length;
    
    setCurrentIndexLeft(prevLeftIndex);
    setCurrentIndexRight(prevRightIndex);
    
    if (imagesLeft[prevLeftIndex]?.navPoint) {
      setUserPosition({
        x: imagesLeft[prevLeftIndex].navPoint.x,
        y: imagesLeft[prevLeftIndex].navPoint.y
      });
    } else if (navPoints.length > 0) {
      const prevPointIndex = (currentNavPointIndex - 1 + navPoints.length) % navPoints.length;
      setUserPosition({
        x: navPoints[prevPointIndex].x,
        y: navPoints[prevPointIndex].y
      });
      setCurrentNavPointIndex(prevPointIndex);
    }
    
    // Update selected point in graph if we have graph data
    if (graphPoints.length > 0) {
      setSelectedPointIndex(prevLeftIndex % graphPoints.length);
    }
  };

  const handlePause = () => {
    setIsPaused((prevIsPaused) => !prevIsPaused);
  };

  const handleImageClick = () => {
    setIsPaused(true);
  };

  const updateFloorMapOrientation = (direction, cameraRotation) => {
    if (cameraRotation !== undefined) {
      setFloorMapRotation(cameraRotation);
    } else {
      switch (direction) {
        case "left":
          setFloorMapRotation(prev => (prev - 5) % 360);
          break;
        case "right":
          setFloorMapRotation(prev => (prev + 5) % 360);
          break;
        default:
          break;
      }
    }
  };

  const updateUserPosition = (direction, distance = 2) => {
    setUserPosition(prev => {
      const radians = (floorMapRotation * Math.PI) / 180;
      let dx = 0, dy = 0;
      
      if (direction === "up") {
        dx = Math.sin(radians) * distance;
        dy = -Math.cos(radians) * distance;
      } else if (direction === "down") {
        dx = -Math.sin(radians) * distance;
        dy = Math.cos(radians) * distance;
      } else if (direction === "left") {
        dx = -Math.cos(radians) * distance;
        dy = -Math.sin(radians) * distance;
      } else if (direction === "right") {
        dx = Math.cos(radians) * distance;
        dy = Math.sin(radians) * distance;
      }
      
      return {
        x: Math.max(0, Math.min(100, prev.x + dx)),
        y: Math.max(0, Math.min(100, prev.y + dy))
      };
    });
  };

  const toggleGraphOnMap = () => {
    setShowGraphOnMap(prev => !prev);
  };
  
  // Handle graph point click from the LineGraph component
  const handleGraphPointClick = (pointNumber) => {
    setIsPaused(true); // Pause any automatic cycling
    
    // Set the selected point index
    setSelectedPointIndex(pointNumber - 1);
    
    // Get the corresponding image index
    const imageIndex = graphPointToImageMap[pointNumber - 1] || 0;
    
    // Update both views with the selected image
    setCurrentIndexLeft(imageIndex);
    setCurrentIndexRight(imageIndex);
    
    // Update user position based on the image's navigation point
    if (imagesLeft[imageIndex]?.navPoint) {
      setUserPosition({
        x: imagesLeft[imageIndex].navPoint.x,
        y: imagesLeft[imageIndex].navPoint.y
      });
    } else if (graphPoints[pointNumber - 1]) {
      // If no nav point but we have graph data, use the graph point
      // Scale graph coordinates to map coordinates (assuming they're in the same coordinate system)
      const [x, y] = graphPoints[pointNumber - 1];
      
      // Normalize coordinates to 0-100 range for the floor map display
      // This is a basic scaling and might need adjustment based on your data
      const minX = Math.min(...graphPoints.map(point => point[0]));
      const maxX = Math.max(...graphPoints.map(point => point[0]));
      const minY = Math.min(...graphPoints.map(point => point[1]));
      const maxY = Math.max(...graphPoints.map(point => point[1]));
      
      const normalizedX = ((x - minX) / (maxX - minX)) * 100;
      const normalizedY = ((y - minY) / (maxY - minY)) * 100;
      
      setUserPosition({
        x: normalizedX,
        y: normalizedY
      });
    }
  };

  const handleGraphDataLoad = (data) => {
    setGraphData(data);
    
    // Process raw points data
    if (data && data.points) {
      // Extract point coordinates
      const points = data.points.map(point => [point.x || 0, point.y || 0]);
      setGraphPoints(points);
      
      // Create mapping of graph points to images
      if (imagesLeft.length > 0) {
        const pointMap = {};
        points.forEach((_, index) => {
          const imageIndex = Math.min(index, imagesLeft.length - 1);
          pointMap[index] = imageIndex;
        });
        setGraphPointToImageMap(pointMap);
      }
    }
  };

  const FloorMapOverlay = ({ rotation, userPosition }) => {
    const mapContainerStyle = {
      position: 'absolute',
      top: '20px',
      right: '20px',
      width: '200px',
      height: '200px',
      border: '2px solid #333',
      borderRadius: '5px',
      overflow: 'hidden',
      zIndex: 100,
      backgroundColor: 'white',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
    };

    const mapStyle = {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transition: 'transform 0.2s ease-out',
    };

    const userPositionStyle = {
      position: 'absolute',
      left: `${userPosition.x}%`,
      top: `${userPosition.y}%`,
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      backgroundColor: 'red',
      transform: 'translate(-50%, -50%)',
      boxShadow: '0 0 0 2px white',
      zIndex: 101,
    };

    const directionIndicatorStyle = {
      position: 'absolute',
      left: `${userPosition.x}%`,
      top: `${userPosition.y}%`,
      width: '0',
      height: '0',
      borderLeft: '6px solid transparent',
      borderRight: '6px solid transparent',
      borderBottom: '12px solid blue',
      transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
      transformOrigin: 'center bottom',
      zIndex: 102,
    };

    const renderNavPoints = () => {
      return navPoints.map((point, index) => {
        const navPointStyle = {
          position: 'absolute',
          left: `${point.x}%`,
          top: `${point.y}%`,
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: index === currentNavPointIndex ? 'yellow' : 'blue',
          transform: 'translate(-50%, -50%)',
          zIndex: 100,
        };
        
        return <div key={index} style={navPointStyle} title={point.label || `Point ${index+1}`}></div>;
      });
    };

    // Render path based on graph data
    const renderGraphPath = () => {
      if (!graphData || !showGraphOnMap) return null;
      
      // First, check if we have graphPoints from floor plan
      if (graphPoints.length > 0) {
        // Normalize coordinates to 0-100 range for the floor map display
        const minX = Math.min(...graphPoints.map(point => point[0]));
        const maxX = Math.max(...graphPoints.map(point => point[0]));
        const minY = Math.min(...graphPoints.map(point => point[1]));
        const maxY = Math.max(...graphPoints.map(point => point[1]));
        
        const normalizedPoints = graphPoints.map(([x, y]) => ({
          x: ((x - minX) / (maxX - minX)) * 100,
          y: ((y - minY) / (maxY - minY)) * 100
        }));
        
        return (
          <svg style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 99,
          }}>
            <path
              d={normalizedPoints.map((point, i) => (
                `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
              )).join(' ')}
              stroke="rgba(255, 0, 0, 0.7)"
              strokeWidth="2"
              fill="none"
              strokeDasharray="5,5"
            />
            {normalizedPoints.map((point, i) => (
              <circle
                key={i}
                cx={point.x}
                cy={point.y}
                r="3"
                fill={i === selectedPointIndex ? "yellow" : i === 0 ? "green" : i === normalizedPoints.length - 1 ? "red" : "orange"}
              />
            ))}
          </svg>
        );
      }
      
      // If no graphPoints, try to use graphData.points
      try {
        const pathPoints = graphData.points || [];
        
        if (pathPoints.length === 0) return null;
        
        // Create SVG path
        return (
          <svg style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 99,
          }}>
            <path
              d={pathPoints.map((point, i) => {
                // Scale the points to percentage coordinates
                const x = point.x || (point.xPos ? point.xPos * 100 : 0);
                const y = point.y || (point.yPos ? point.yPos * 100 : 0);
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')}
              stroke="rgba(255, 0, 0, 0.7)"
              strokeWidth="2"
              fill="none"
              strokeDasharray="5,5"
            />
            {pathPoints.map((point, i) => (
              <circle
                key={i}
                cx={point.x || (point.xPos ? point.xPos * 100 : 0)}
                cy={point.y || (point.yPos ? point.yPos * 100 : 0)}
                r="3"
                fill={i === selectedPointIndex ? "yellow" : i === 0 ? "green" : i === pathPoints.length - 1 ? "red" : "orange"}
              />
            ))}
          </svg>
        );
      } catch (error) {
        console.error("Error rendering graph path:", error);
        return null;
      }
    };

    const controlsStyle = {
      position: 'absolute',
      top: '5px',
      right: '5px',
      zIndex: 103,
    };

    // If we don't have actual graph data yet, create a dummy path for demo purposes
    const createDummyPath = () => {
      if (!showGraphOnMap) return null;
      
      // Create a path that connects the navigation points
      const dummyPoints = navPoints.length > 1 ? 
        navPoints : 
        [
          { x: 20, y: 20 },
          { x: 40, y: 30 },
          { x: 60, y: 40 },
          { x: 80, y: 60 },
          { x: 70, y: 80 }
        ];
      
      return (
        <svg style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 99,
        }}>
          <path
            d={dummyPoints.map((point, i) => (
              `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
            )).join(' ')}
            stroke="rgba(255, 0, 0, 0.7)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="5,5"
          />
          {dummyPoints.map((point, i) => (
            <circle
              key={i}
              cx={point.x}
              cy={point.y}
              r="3"
              fill={i === selectedPointIndex % dummyPoints.length ? "yellow" : i === 0 ? "green" : i === dummyPoints.length - 1 ? "red" : "orange"}
            />
          ))}
        </svg>
      );
    };

    return (
      <div style={mapContainerStyle}>
        <div style={controlsStyle}>
          <Button 
            variant="contained" 
            color="primary" 
            size="small" 
            onClick={toggleGraphOnMap}
            style={{ padding: '2px 5px', fontSize: '10px' }}
          >
            {showGraphOnMap ? 'Hide Path' : 'Show Path'}
          </Button>
        </div>

        {floorMapUrl ? (
          <>
            <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
              <div style={{
                width: '100%', 
                height: '100%', 
                position: 'absolute',
                transform: `rotate(${-rotation}deg)`,
              }}>
                <img 
                  src={floorMapUrl} 
                  alt="Floor Map" 
                  style={mapStyle} 
                />
                {renderNavPoints()}
                {graphData || graphPoints.length > 0 ? renderGraphPath() : createDummyPath()}
              </div>
              <div style={userPositionStyle}></div>
              <div style={directionIndicatorStyle}></div>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <img 
              src={staticFloorMapImage} 
              alt="Default Floor Map" 
              style={mapStyle} 
            />
            {graphData || graphPoints.length > 0 ? renderGraphPath() : createDummyPath()}
          </div>
        )}
      </div>
    );
  };

  const renderImage = (imageObj) => {
    if (!imageObj || typeof imageObj !== 'object' || !imageObj.image) {
      return (
        <div
          style={{
            position: "relative",
            height: "100%",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#f0f0f0",
          }}
        >
          <Typography variant="caption" color="textSecondary">
            No Image Available
          </Typography>
        </div>
      );
    }

    const url = `https://api.capture360.ai/${imageObj.image}`;
    const timestamp = imageObj.timestamp || "Unknown Date";

    return (
      <div
        style={{
          position: "relative",
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography
          variant="caption"
          style={{
            position: "absolute",
            top: "4px",
            left: "4px",
            padding: "4px",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            color: "white",
            borderRadius: "4px",
          }}
        >
          {timestamp}
        </Typography>
        <VRScene 
          imageUrl={url} 
          arrowDirection={arrowDirection} 
          setArrowDirection={setArrowDirection} 
          updateFloorMapOrientation={updateFloorMapOrientation}
          updateUserPosition={updateUserPosition}
          setCursorValues={setCursorValues}
        />
      </div>
    );
  };

  // Mini LineGraph component for the floor map
  const MiniLineGraph = ({ data, containerStyle }) => {
    if (!data) return null;
    
    const graphStyle = {
      position: 'absolute',
      bottom: '10px',
      left: '10px',
      width: '180px',
      height: '70px',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      padding: '5px',
      borderRadius: '3px',
      zIndex: 103,
      ...containerStyle
    };
    
    return (
      <div style={graphStyle}>
        <Typography variant="caption" style={{ fontWeight: 'bold', marginBottom: '3px' }}>
          Path Data
        </Typography>
        <div style={{ width: '100%', height: '40px' }}>
          {/* Simplified line graph visualization */}
          <svg width="100%" height="100%" viewBox="0 0 100 30">
            <polyline
              points="0,30 20,20 40,25 60,15 80,10 100,5"
              fill="none"
              stroke="blue"
              strokeWidth="2"
            />
            <line x1="0" y1="30" x2="100" y2="30" stroke="#ccc" strokeWidth="1" />
          </svg>
        </div>
      </div>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "20px",
          position: "relative",
        }}
      >
        <div style={{ display: 'flex', width: '100%', height: '100%' }}>
          <div style={{ flex: 1, padding: '10px', position: 'relative' }}>
            <Typography variant="h6">Select Date</Typography>
            <Select
              value={selectedDateLeft}
              onChange={handleDateChangeLeft}
              fullWidth
            >
              {dates.map(date => (
                <MenuItem key={date} value={date}>
                  {date}
                </MenuItem>
              ))}
            </Select>
            <ButtonGroup
              variant="contained"
              aria-label="outlined primary button group"
              style={{ marginTop: '10px', marginLeft:"70%" }}
            >
              <Button onClick={handlePrevLeft}>Previous</Button>
              <Button onClick={handlePause}>{isPaused ? 'Play' : 'Pause'}</Button>
              <Button onClick={handleNextLeft}>Next</Button>
            </ButtonGroup>
            <div style={{ height: '70vh', marginTop: '10px', position: 'relative' }}>
              {renderImage(imagesLeft[currentIndexLeft])}
              <FloorMapOverlay 
                rotation={floorMapRotation} 
                userPosition={userPosition}
              />
              {/* Add mini line graph to the floor map */}
              {showGraphOnMap && <MiniLineGraph data={graphData} />}
            </div>
          </div>
          <div style={{ flex: 1, padding: '10px', position: 'relative' }}>
            <Typography variant="h6">Select Date</Typography>
            <Select
              value={selectedDateRight}
              onChange={handleDateChangeRight}
              fullWidth
              style={{marginBottom:45}}
            >
              {dates.map(date => (
                <MenuItem key={date} value={date}>
                  {date}
                </MenuItem>
              ))}
            </Select>
            <div style={{ height: '70vh', marginTop: '10px', position: 'relative' }}>
              {renderImage(imagesRight[currentIndexRight])}
              <FloorMapOverlay 
                rotation={floorMapRotation} 
                userPosition={userPosition}
              />
              {/* Add mini line graph to the floor map */}
              {showGraphOnMap && <MiniLineGraph data={graphData} />}
            </div>
          </div>
        </div>
        
        {jsonid && (
          <LineGraph
            id={jsonid}
            setCurrentIndexLeft={setCurrentIndexLeft}
            setCurrentIndexRight={setCurrentIndexRight}
            maxFrames={Math.min(imagesLeft.length, imagesRight.length)}
            onGraphDataLoad={(data) => setGraphData(data)}
          />
        )}

        {/* Display cursor movement values */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          backgroundColor: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          zIndex: 1000,
        }}>
          <Typography variant="body2">
            Cursor Position: X: {cursorValues.x.toFixed(2)}, Y: {cursorValues.y.toFixed(2)}
          </Typography>
        </div>
      </div>
    </ThemeProvider>
  );  
};

const VRScene = ({ imageUrl, arrowDirection, setArrowDirection, updateFloorMapOrientation, updateUserPosition, setCursorValues }) => {
  const [skySrc, setSkySrc] = useState('');
  const vrSceneRef = useRef(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0, z: -2 });
  const cameraRef = useRef(null);
  const [cameraRotation, setCameraRotation] = useState({ x: 0, y: 0, z: 0 });
  const [isMoving, setIsMoving] = useState(false);
  const [movementDirection, setMovementDirection] = useState(null);
  const lastMousePosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch(imageUrl, {
          headers: {
            Accept: "application/json",
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          setSkySrc(reader.result);
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error('Error fetching image:', error);
        setSkySrc(imageUrl);
      }
    };
    fetchImages();
  }, [imageUrl]);

  useEffect(() => {
    if (vrSceneRef.current) {
      const scene = vrSceneRef.current.querySelector('a-scene');
      if (scene) {
        scene.addEventListener('loaded', () => {
          const camera = scene.querySelector('a-camera');
          if (camera) {
            cameraRef.current = camera;
            
            camera.addEventListener('componentchanged', (event) => {
              if (event.detail.name === 'rotation') {
                const rotation = event.detail.newData;
                setCameraRotation(rotation);
                updateFloorMapOrientation(null, -rotation.y);
              }
            });
          }
        });
      }
    }
  }, [vrSceneRef.current]);

  useEffect(() => {
    if (isMoving && movementDirection) {
      const moveInterval = setInterval(() => {
        updateUserPosition(movementDirection, 1);
      }, 100);
      
      return () => clearInterval(moveInterval);
    }
  }, [isMoving, movementDirection]);

  const handleMouseMove = (event) => {
    const x = (event.clientX / window.innerWidth) * 2 - 1;
    const y = -(event.clientY / window.innerHeight) * 2 + 1;
    const z = -2;

    const movementX = event.clientX - lastMousePosition.current.x;
    const movementY = event.clientY - lastMousePosition.current.y;
    
    lastMousePosition.current = { x: event.clientX, y: event.clientY };

    setCursorPos({ x, y, z });
    setCursorValues({ x, y });

    if (Math.abs(movementX) > Math.abs(movementY)) {
      const direction = movementX > 0 ? "right" : "left";
      setArrowDirection(direction);
      setMovementDirection(direction);
    } else {
      const direction = movementY > 0 ? "down" : "up";
      setArrowDirection(direction);
      setMovementDirection(direction);
    }
  };

  const handleMouseDown = () => {
    setIsMoving(true);
  };

  const handleMouseUp = () => {
    setIsMoving(false);
  };

  const ArrowComponent = ({ direction }) => {
    const arrowStyle = {
      position: 'absolute',
      top: `${cursorPos.y * 0 + 50}%`,
      left: `${cursorPos.x * 0 + 50}%`,
      zIndex: 10,
      fontSize: '24px',
      fontWeight: 'bold',
      backgroundColor: 'transparent',
      pointerEvents: 'none',
      color: isMoving ? 'red' : 'white',
    };

    const arrowMap = {
      up: "↑",
      down: "↓",
      left: "←",
      right: "→"
    };

    return (
      <div style={arrowStyle}>
        {arrowMap[direction]}
      </div>
    );
  };

  return (
    <div
      ref={vrSceneRef}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ height: "100%", width: "100%", position: "relative", cursor: "none" }}
    >
      <a-scene
        embedded
        vr-mode-ui="enabled: true"
        style={{ height: '100%', width: '100%' }}
      >
        <a-sky src={skySrc} rotation="0 0 0"></a-sky>
        <a-camera position="0 1.6 0">
          <a-cursor color="white" fuse="true" fuse-timeout="500"></a-cursor>
        </a-camera>
        <a-light type="ambient" color="#888"></a-light>
        <a-light type="directional" position="-1 1 0" color="#FFF"></a-light>
        <a-image
          src={arrowimg}
          position={`${cursorPos.x * 3} ${cursorPos.y * 3} ${cursorPos.z}`}
          width="0.5" height="0.5"
          rotation="0 0 0"
          look-at="[camera]"
        ></a-image>
      </a-scene>

      <ArrowComponent direction={arrowDirection} />
      
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        backgroundColor: 'rgba(0,0,0,0.5)',
        color: 'white',
        padding: '5px',
        borderRadius: '5px',
        fontSize: '12px'
      }}>
        Click and drag to look around. Click and hold to move in that direction.
      </div>
    </div>
  );
};

export default ImageGalleryComponent;