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
        `https://11e1-2409-40f4-201c-1293-5d5-d14d-51a9-ff05.ngrok-free.app/building/api/video-frames/plan/${buildingId}/`,
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
        setFloorMapUrl(`https://11e1-2409-40f4-201c-1293-5d5-d14d-51a9-ff05.ngrok-free.app/${data[0].image}`);
        fetchNavigationPoints(buildingId, data[0].id);
      } else {
        console.warn("No floor map found for this building");
      }
    } catch (error) {
      console.error("Failed to fetch floor map:", error);
    }
  };
  

  const fetchNavigationPoints = async (buildingId, floorMapId) => {
    try {
      const response = await fetch(
        `https://11e1-2409-40f4-201c-1293-5d5-d14d-51a9-ff05.ngrok-free.app/building/api/navigation-points/building/${buildingId}/floor/${floorMapId}/`,
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
        `https://9a7e-2409-40f4-201c-1293-8db2-f79e-87d0-63ff.ngrok-free.app/building/api/video-frames/plan/${id}/video/${frameId}/`,
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
      setJsonid(imageData[0]?.json);
      
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
          setImageUrlRight(imagesWithNavData[0]?.image ? `https://9a7e-2409-40f4-201c-1293-8db2-f79e-87d0-63ff.ngrok-free.app/${imagesWithNavData[0].image}` : "");
          
          if (imagesWithNavData[0]?.navPoint) {
            setUserPosition({
              x: imagesWithNavData[0].navPoint.x,
              y: imagesWithNavData[0].navPoint.y
            });
          }
        } else {
          setImagesLeft(imagesWithNavData);
          setCurrentIndexLeft(0);
          setImageUrlLeft(imagesWithNavData[0]?.image ? `https://9a7e-2409-40f4-201c-1293-8db2-f79e-87d0-63ff.ngrok-free.app/${imagesWithNavData[0].image}` : "");
          
          if (imagesWithNavData[0]?.navPoint) {
            setUserPosition({
              x: imagesWithNavData[0].navPoint.x,
              y: imagesWithNavData[0].navPoint.y
            });
          }
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
        `https://9a7e-2409-40f4-201c-1293-8db2-f79e-87d0-63ff.ngrok-free.app/building/api/video-frames/plan/${id}/`,
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

    return (
      <div style={mapContainerStyle}>
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
              </div>
              <div style={userPositionStyle}></div>
              <div style={directionIndicatorStyle}></div>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography variant="caption">Floor Map Not Available</Typography>
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

    const url = `https://9a7e-2409-40f4-201c-1293-8db2-f79e-87d0-63ff.ngrok-free.app/${imageObj.image}`;
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
            </div>
          </div>
        </div>
        
        {jsonid && (
          <LineGraph
            id={jsonid}
            setCurrentIndexLeft={setCurrentIndexLeft}
            setCurrentIndexRight={setCurrentIndexRight}
            maxFrames={Math.min(imagesLeft.length, imagesRight.length)}
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