import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Typography from "@mui/material/Typography";
//import LineGraph from "./LineGraph";
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
  const [showLineGraphOnMap, setShowLineGraphOnMap] = useState(true);
  const [indicatorRotation, setIndicatorRotation] = useState(0);

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
      
      if (!Array.isArray(imageData) || imageData.length === 0) {
        console.warn(`No images found for date: ${date}`);
        if (isRight) {
          setImagesRight([]);
          setCurrentIndexRight(0);
        } else {
          setImagesLeft([]);
          setCurrentIndexLeft(0);
        }
        return;
      }

      const validImages = imageData.filter(
        (image) => image && image.image
      ).map((image) => {
        const matchingNavPoint = navPoints.find(point => 
          point.frameId === image.id
        );
        
        return {
          ...image,
          navPoint: matchingNavPoint ? {
            x: matchingNavPoint.x,
            y: matchingNavPoint.y,
            label: matchingNavPoint.label
          } : null
        };
      });

      if (isRight) {
        setImagesRight(validImages);
        setCurrentIndexRight(0);
        
        if (validImages[0]?.navPoint) {
          setUserPosition({
            x: validImages[0].navPoint.x,
            y: validImages[0].navPoint.y
          });
        }
      } else {
        setImagesLeft(validImages);
        setCurrentIndexLeft(0);
        
        if (validImages[0]?.navPoint) {
          setUserPosition({
            x: validImages[0].navPoint.x,
            y: validImages[0].navPoint.y
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch images:", error);
      if (isRight) {
        setImagesRight([]);
        setCurrentIndexRight(0);
      } else {
        setImagesLeft([]);
        setCurrentIndexLeft(0);
      }
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

        // Set the actual dates array properly
        const dateValues = dateList.map(({ date }) => date);
        setDates(dateValues);
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
  };

  const handlePause = () => {
    setIsPaused((prevIsPaused) => !prevIsPaused);
  };

  const handleImageClick = () => {
    setIsPaused(true);
  };

    const updateUserPositionByAngle = (angleInDegrees) => {
    setUserPosition(prev => {
      const radians = (angleInDegrees * Math.PI) / 180;
      const speed = 2; // Adjust for movement sensitivity
  
      const dx = Math.cos(radians) * speed;
      const dy = Math.sin(radians) * speed;
  
      const newX = Math.max(0, Math.min(100, prev.x + dx));
      const newY = Math.max(0, Math.min(100, prev.y + dy));
  
      // Update indicator angle to match movement direction
      setIndicatorRotation(angleInDegrees);
  
      return { x: newX, y: newY };
    });
  };
  
  const updateFloorMapOrientation = (direction, cameraRotation) => {
    let newRotation;
  
    if (cameraRotation !== undefined) {
      // For full 360-degree rotation based on camera
      newRotation = -cameraRotation;
    } else {
      // Discrete rotation for specific directions
      switch (direction) {
        case "left":
          newRotation = floorMapRotation - 45;
          break;
        case "right":
          newRotation = floorMapRotation + 45;
          break;
        case "up":
          newRotation = floorMapRotation - 90;
          break;
        case "down":
          newRotation = floorMapRotation + 90;
          break;
        default:
          return;
      }
    }
  
    newRotation = (newRotation + 360) % 360;
    setFloorMapRotation(newRotation);
    setIndicatorRotation(newRotation);
  };
  

  const FloorMapOverlay = ({ rotation, userPosition }) => {
    const mapContainerStyle = {
      position: 'absolute',
      top: '20px',
      right: '20px',
      width: '150px',
      height: '150px',
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
      width: '30px',
      height: '30px',
      background: 'radial-gradient(rgba(255, 255, 0, 0.2), rgba(255, 255, 0, 0.6))',
      clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
      transform: `translate(-50%, -100%) rotate(${indicatorRotation}deg)`,
      transformOrigin: 'center bottom',
      pointerEvents: 'none',
      zIndex: 102,
      transition: 'transform 0.4s ease-in-out, left 0.2s ease, top 0.2s ease',
      filter: 'drop-shadow(0 0 8px rgba(255, 255, 0, 0.4))',
      opacity: 0.85,
    };
  
    const renderDottedLinePath = () => {
      if (!navPoints || navPoints.length < 2) return null;
  
      const lines = [];
  
      for (let i = 0; i < navPoints.length - 1; i++) {
        const from = navPoints[i];
        const to = navPoints[i + 1];
  
        const lineStyle = {
          position: 'absolute',
          left: `${from.x}%`,
          top: `${from.y}%`,
          width: '2px',
          height: `${Math.hypot(to.x - from.x, to.y - from.y)}%`,
          backgroundImage: 'linear-gradient(to bottom, yellow 30%, transparent 30%)',
          backgroundSize: '2px 6px',
          transformOrigin: 'top left',
          transform: `translate(-50%, -50%) rotate(${Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI}deg)`,
          zIndex: 98,
          pointerEvents: 'none',
        };
  
        lines.push(<div key={`line-${i}`} style={lineStyle}></div>);
      }
  
      return lines;
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
  
        return (
          <div
            key={index}
            style={navPointStyle}
            title={point.label || `Point ${index + 1}`}
          ></div>
        );
      });
    };
  
    return (
      <div style={mapContainerStyle}>
        {floorMapUrl ? (
          <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
            <div style={{ width: '100%', height: '100%', position: 'absolute' }}>
              <img src={floorMapUrl} alt="Floor Map" style={mapStyle} />
              {renderNavPoints()}
              {renderDottedLinePath()}
            </div>
            <div style={userPositionStyle}></div>
            <div style={directionIndicatorStyle}></div>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <img src={staticFloorMapImage} alt="Default Floor Map" style={mapStyle} />
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
          updateUserPositionByAngle={updateUserPositionByAngle}
          setCursorValues={setCursorValues}
        />
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

        
        {/* Split View (only view available now) */}
        <div style={{ display: 'flex', width: '100%', height: '100%' }}>
          <div style={{ flex: 1, padding: '10px', position: 'relative' }}>
            <Typography variant="h6">Select Date</Typography>
            {/* Fixed Select component for left side */}
            <Select
              value={selectedDateLeft}
              onChange={handleDateChangeLeft}
              fullWidth
              displayEmpty
              renderValue={(selected) => selected ? selected : "Select a date"}
            >
              {dates && dates.length > 0 ? (
                dates.map((date, index) => (
                  <MenuItem key={`left-${date}-${index}`} value={date}>
                    {date}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No dates available</MenuItem>
              )}
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
            </div>
          </div>
          <div style={{ flex: 1, padding: '10px', position: 'relative' }}>
            <Typography variant="h6">Select Date</Typography>
            {/* Fixed Select component for right side */}
            <Select
              value={selectedDateRight}
              onChange={handleDateChangeRight}
              fullWidth
              displayEmpty
              renderValue={(selected) => selected ? selected : "Select a date"}
              style={{marginBottom:45}}
            >
              {dates && dates.length > 0 ? (
                dates.map((date, index) => (
                  <MenuItem key={`right-${date}-${index}`} value={date}>
                    {date}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No dates available</MenuItem>
              )}
            </Select>
            <div style={{ height: '70vh', marginTop: '10px', position: 'relative' }}>
              {renderImage(imagesRight[currentIndexRight])}
              <FloorMapOverlay 
                rotation={floorMapRotation} 
                userPosition={userPosition}
              />
            </div>
          </div>
        </div>

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

    // Enhance rotation detection
    if (event.buttons === 1) { // Check if mouse button is pressed
      if (Math.abs(movementX) > Math.abs(movementY)) {
        const direction = movementX > 0 ? "right" : "left";
        setArrowDirection(direction);
        updateFloorMapOrientation(direction);
      } else {
        const direction = movementY > 0 ? "down" : "up";
        setArrowDirection(direction);
      }
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