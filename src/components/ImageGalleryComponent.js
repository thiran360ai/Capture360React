import React, { useState, useEffect,useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import * as THREE from 'three';
// Import a static floor map image
import staticFloorMapImage from './static-floor-map.jpg';

// Import static 360 images (you'll need to add these to your project)
import static360Image1 from './static-floor-map.jpg';
import static360Image2 from './static-floor-map.jpg';
import static360Image3 from './static-floor-map.jpg';
import static360Image4 from './static-floor-map.jpg';

const theme = createTheme();

// Static 360 images array
const staticImages = [
  { image: static360Image1, timestamp: "2024-03-15 09:30:00", navPoint: { x: 30, y: 40, label: "Entry" } },
  { image: static360Image2, timestamp: "2024-03-15 10:15:00", navPoint: { x: 45, y: 55, label: "Hallway" } },
  { image: static360Image3, timestamp: "2024-03-15 11:00:00", navPoint: { x: 60, y: 35, label: "Office" } },
  { image: static360Image4, timestamp: "2024-03-15 11:45:00", navPoint: { x: 75, y: 50, label: "Conference" } },
];

// Static navigation points
const staticNavPoints = [
  { id: 1, x: 30, y: 40, label: "Entry", frameId: 1, videoId: 101 },
  { id: 2, x: 45, y: 55, label: "Hallway", frameId: 2, videoId: 101 },
  { id: 3, x: 60, y: 35, label: "Office", frameId: 3, videoId: 101 },
  { id: 4, x: 75, y: 50, label: "Conference", frameId: 4, videoId: 101 },
  { id: 5, x: 50, y: 70, label: "Kitchen", frameId: 5, videoId: 101 },
];

const ImageGalleryComponent = () => {
  const location = useLocation();
  const { id } = location.state || { id: 1 }; // Default ID if none provided
  const [imagesLeft, setImagesLeft] = useState([]);
  const [imagesRight, setImagesRight] = useState([]);
  const [currentIndexLeft, setCurrentIndexLeft] = useState(0);
  const [currentIndexRight, setCurrentIndexRight] = useState(0);
  const [isPaused, setIsPaused] = useState(true); // Start paused
  const [dates, setDates] = useState(["2024-03-15", "2024-03-16"]);
  const [selectedDateLeft, setSelectedDateLeft] = useState("2024-03-15");
  const [selectedDateRight, setSelectedDateRight] = useState("2024-03-15");
  const [isSplitScreen, setIsSplitScreen] = useState(true);
  const [floorMapUrl, setFloorMapUrl] = useState(staticFloorMapImage);
  const [userPosition, setUserPosition] = useState({ x: 50, y: 50 });
  const [jsonid, setJsonid] = useState(1); // Default JSON ID
  const [navPoints, setNavPoints] = useState(staticNavPoints);
  const [currentNavPointIndex, setCurrentNavPointIndex] = useState(0);
  const [cursorValues, setCursorValues] = useState({ x: 0, y: 0 });
  const [showLineGraphOnMap, setShowLineGraphOnMap] = useState(true);
  const [arrowDirection, setArrowDirection] = useState("up");
  const [torchRotation, setTorchRotation] = useState(0);
  const [visitedPositions, setVisitedPositions] = useState([]); // Track positions for the line graph
  // Add current camera angle state for both sides
  const [leftCameraAngle, setLeftCameraAngle] = useState(0);
  const [rightCameraAngle, setRightCameraAngle] = useState(0);
  const [isAutoRotationEnabled, setIsAutoRotationEnabled] = useState(true); // Enable auto-rotation by default
  // Remove activeSide state since we want maps to always be visible
  const [activeSide, setActiveSide] = useState(null);

  // Initialize with static data
  useEffect(() => {
    setImagesLeft(staticImages);
    setImagesRight(staticImages);
    setNavPoints(staticNavPoints);
    setUserPosition({ x: staticNavPoints[0].x, y: staticNavPoints[0].y });
    // Initialize visited positions with the first nav point
    setVisitedPositions([{ x: staticNavPoints[0].x, y: staticNavPoints[0].y }]);
  }, []);

  // Timer for auto-rotation
  useEffect(() => {
    if (!isPaused) {
      const intervalId = setInterval(() => {
        setCurrentIndexLeft((prevIndex) => (prevIndex + 1) % imagesLeft.length);
        setCurrentIndexRight((prevIndex) => (prevIndex + 1) % imagesRight.length);
      }, 3000);

      return () => clearInterval(intervalId);
    }
  }, [imagesLeft.length, imagesRight.length, isPaused]);

  // Update user position when image changes
  useEffect(() => {
    if (imagesLeft[currentIndexLeft]?.navPoint) {
      const newPosition = {
        x: imagesLeft[currentIndexLeft].navPoint.x,
        y: imagesLeft[currentIndexLeft].navPoint.y
      };
      
      setUserPosition(newPosition);
      
      // Add to visited positions for line graph
      setVisitedPositions(prev => {
        // Check if this position is significantly different from the last one
        const lastPos = prev[prev.length - 1];
        const distance = Math.sqrt(
          Math.pow(lastPos.x - newPosition.x, 2) + 
          Math.pow(lastPos.y - newPosition.y, 2)
        );
        
        // Only add if it's a new position (distance > 1)
        if (distance > 1) {
          return [...prev, newPosition];
        }
        return prev;
      });
      
      // Find corresponding nav point index
      const navPointIndex = navPoints.findIndex(
        point => point.x === imagesLeft[currentIndexLeft].navPoint.x && 
                point.y === imagesLeft[currentIndexLeft].navPoint.y
      );
      
      if (navPointIndex !== -1) {
        setCurrentNavPointIndex(navPointIndex);
      }
    }
  }, [currentIndexLeft, imagesLeft, navPoints]);

  const handleDateChangeLeft = (event) => {
    const newDate = event.target.value;
    setSelectedDateLeft(newDate);
    // In a real app, you would fetch images for this date
    // For now, we'll just randomize the order of static images
    setImagesLeft([...staticImages].sort(() => Math.random() - 0.5));
    setCurrentIndexLeft(0);
    // Reset visited positions for the new date
    const firstPoint = staticNavPoints[0];
    setVisitedPositions([{ x: firstPoint.x, y: firstPoint.y }]);
  };

  const handleDateChangeRight = (event) => {
    const newDate = event.target.value;
    setSelectedDateRight(newDate);
    // In a real app, you would fetch images for this date
    // For now, we'll just randomize the order of static images
    setImagesRight([...staticImages].sort(() => Math.random() - 0.5));
    setCurrentIndexRight(0);
  };

  const handleNextLeft = () => {
    const nextLeftIndex = (currentIndexLeft + 1) % imagesLeft.length;
    const nextRightIndex = (currentIndexRight + 1) % imagesRight.length;
    
    setCurrentIndexLeft(nextLeftIndex);
    setCurrentIndexRight(nextRightIndex);
    
    if (imagesLeft[nextLeftIndex]?.navPoint) {
      const newPosition = {
        x: imagesLeft[nextLeftIndex].navPoint.x,
        y: imagesLeft[nextLeftIndex].navPoint.y
      };
      
      setUserPosition(newPosition);
      
      // Add to visited positions for line graph
      setVisitedPositions(prev => {
        const lastPos = prev[prev.length - 1];
        const distance = Math.sqrt(
          Math.pow(lastPos.x - newPosition.x, 2) + 
          Math.pow(lastPos.y - newPosition.y, 2)
        );
        
        if (distance > 1) {
          return [...prev, newPosition];
        }
        return prev;
      });
    } else if (navPoints.length > 0) {
      const nextPointIndex = (currentNavPointIndex + 1) % navPoints.length;
      const newPosition = {
        x: navPoints[nextPointIndex].x,
        y: navPoints[nextPointIndex].y
      };
      
      setUserPosition(newPosition);
      setCurrentNavPointIndex(nextPointIndex);
      
      // Add to visited positions
      setVisitedPositions(prev => [...prev, newPosition]);
    }
  };

  const handlePrevLeft = () => {
    const prevLeftIndex = (currentIndexLeft - 1 + imagesLeft.length) % imagesLeft.length;
    const prevRightIndex = (currentIndexRight - 1 + imagesRight.length) % imagesRight.length;
    
    setCurrentIndexLeft(prevLeftIndex);
    setCurrentIndexRight(prevRightIndex);
    
    if (imagesLeft[prevLeftIndex]?.navPoint) {
      const newPosition = {
        x: imagesLeft[prevLeftIndex].navPoint.x,
        y: imagesLeft[prevLeftIndex].navPoint.y
      };
      
      setUserPosition(newPosition);
      
      // Add to visited positions for line graph
      setVisitedPositions(prev => {
        const lastPos = prev[prev.length - 1];
        const distance = Math.sqrt(
          Math.pow(lastPos.x - newPosition.x, 2) + 
          Math.pow(lastPos.y - newPosition.y, 2)
        );
        
        if (distance > 1) {
          return [...prev, newPosition];
        }
        return prev;
      });
    } else if (navPoints.length > 0) {
      const prevPointIndex = (currentNavPointIndex - 1 + navPoints.length) % navPoints.length;
      const newPosition = {
        x: navPoints[prevPointIndex].x,
        y: navPoints[prevPointIndex].y
      };
      
      setUserPosition(newPosition);
      setCurrentNavPointIndex(prevPointIndex);
      
      // Add to visited positions
      setVisitedPositions(prev => [...prev, newPosition]);
    }
  };

  const handlePause = () => {
    setIsPaused((prevIsPaused) => !prevIsPaused);
  };

  // Function to update camera angle state for the appropriate side
  const handleCameraRotationUpdate = (angle, side) => {
    if (side === 'left') {
      setLeftCameraAngle(angle);
    } else {
      setRightCameraAngle(angle);
    }
    // Update torch rotation to match camera angle
    setTorchRotation(angle);
  };

  // Toggle auto-rotation functionality
  const toggleAutoRotation = () => {
    setIsAutoRotationEnabled(prev => !prev);
  };

  const updateUserPosition = (direction, distance = 2) => {
    setUserPosition(prev => {
      const radians = (leftCameraAngle * Math.PI) / 180;
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
      
      const newPosition = {
        x: Math.max(0, Math.min(100, prev.x + dx)),
        y: Math.max(0, Math.min(100, prev.y + dy))
      };
      
      // Add to visited positions for line graph
      setVisitedPositions(prevPositions => {
        const lastPos = prevPositions[prevPositions.length - 1];
        const posDistance = Math.sqrt(
          Math.pow(lastPos.x - newPosition.x, 2) + 
          Math.pow(lastPos.y - newPosition.y, 2)
        );
        
        // Only add if moved a significant distance
        if (posDistance > 1) {
          return [...prevPositions, newPosition];
        }
        return prevPositions;
      });
      
      return newPosition;
    });
  };

  //Remove the enter/leave handlers since we want the floor map to always be visible
  const handleSideEnter = (side) => {
    setActiveSide(side);
  };
  const handleSideLeave = () => {
    if (!isMouseDown) {
      setActiveSide(null);
    }
  };

  // Track mouse down state
  const [isMouseDown, setIsMouseDown] = useState(false);
  const handleMouseDown = () => setIsMouseDown(true);
  const handleMouseUp = () => setIsMouseDown(false);

  // Add global mouse up listener to handle cases where mouse is released outside the component
  useEffect(() => {
    const handleGlobalMouseUp = () => setIsMouseDown(false);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  // Updated FloorMapOverlay component with improved torch light rotation
  const FloorMapOverlay = ({ rotation, userPosition, side }) => {
    // Get the correct camera angle based on which side this overlay belongs to
    const currentCameraAngle = side === 'left' ? leftCameraAngle : rightCameraAngle;
    
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
      // Ensure the map is always visible
      pointerEvents: 'none', // This prevents the map from capturing mouse events
    };
  
    const mapStyle = {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    };
  
    // Both user position and torch indicator will now be handled in a single component
    const UserPositionWithIndicator = () => {
      return (
        <div
          style={{
            position: 'absolute',
            left: `${userPosition.x}%`,
            top: `${userPosition.y}%`,
            width: '0',
            height: '0',
            zIndex: 103,
            transform: 'translate(0, 0)', // No transformation here
          }}
        >
          <svg 
            width="60" 
            height="60" 
            viewBox="0 0 60 60" 
            style={{ 
              transform: `translate(-30px, -30px) rotate(${currentCameraAngle}deg)`,
              transformOrigin: 'center',
              position: 'absolute',
            }}
          >
            {/* Torch light cone */}
            <defs>
              <radialGradient id={`torchGradient-${side}`} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" stopColor="rgba(255,255,150,0.9)" />
                <stop offset="70%" stopColor="rgba(255,200,50,0.5)" />
                <stop offset="100%" stopColor="rgba(255,150,0,0)" />
              </radialGradient>
            </defs>
            
            {/* Light cone */}
            <path 
              d="M30,30 L10,0 A40,40 0 0,1 50,0 Z" 
              fill={`url(#torchGradient-${side})`} 
              opacity="0.8"
            />
            
            {/* Central dot (user position indicator) - now part of the SVG that rotates */}
            <circle cx="30" cy="30" r="5" fill="#FFD700" />
            <circle cx="30" cy="30" r="3" fill="red" />
          </svg>
        </div>
      );
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
  
    // Render the line graph (path) of visited positions
    const renderLineGraph = () => {
      if (!showLineGraphOnMap || visitedPositions.length < 2) return null;
      
      return (
        <svg 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 98,
            pointerEvents: 'none',
          }}
        >
          <defs>
            <marker
              id="dot"
              viewBox="0 0 10 10"
              refX="5"
              refY="5"
              markerWidth="5"
              markerHeight="5">
              <circle cx="5" cy="5" r="3" fill="orange" />
            </marker>
          </defs>
          
          {/* Draw the path line */}
          <polyline
            points={visitedPositions.map(pos => `${pos.x}%, ${pos.y}%`).join(' ')}
            fill="none"
            stroke="orange"
            strokeWidth="2"
            strokeDasharray="3,3"
            markerMid="url(#dot)"
            markerStart="url(#dot)"
            markerEnd="url(#dot)"
          />
        </svg>
      );
    };
  
    // Style for the angle display container below the map
    const angleDisplayContainerStyle = {
      position: 'absolute',
      top: '175px',  // Position it below the map
      right: '20px',
      width: '150px',
      textAlign: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      color: 'white',
      padding: '5px 0',
      borderRadius: '0 0 5px 5px',
      fontSize: '12px',
      fontWeight: 'bold',
      // Ensure the angle display is always visible
      pointerEvents: 'none', // This prevents the angle display from capturing mouse events
    };
  
    return (
      <>
        <div style={mapContainerStyle}>
          <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
            {/* Map background that doesn't rotate */}
            <div style={{
              width: '100%', 
              height: '100%', 
              position: 'absolute',
            }}>
              <img 
                src={floorMapUrl} 
                alt="Floor Map" 
                style={mapStyle} 
              />
              {renderNavPoints()}
            </div>
            {/* Line graph showing the path */}
            {renderLineGraph()}
            {/* Combined user position and torch indicator that both rotate together */}
            <UserPositionWithIndicator />
          </div>
        </div>
        
        {/* Rotation angle display - Now showing the actual current camera angle */}
        <div style={angleDisplayContainerStyle}>
          Rotation: {Math.round(currentCameraAngle)}°
        </div>
      </>
    );
  };
  
  const renderImage = (imageObj, side) => {
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

    // Use the actual image directly rather than constructing a URL
    const imageUrl = imageObj.image;
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
            zIndex: 10,
          }}
        >
          {timestamp}
        </Typography>
        <VRScene 
          imageUrl={imageUrl} 
          arrowDirection={arrowDirection} 
          setArrowDirection={setArrowDirection} 
          updateUserPosition={updateUserPosition}
          setCursorValues={setCursorValues}
          side={side}
          torchRotation={torchRotation}
          setTorchRotation={setTorchRotation}
          onCameraRotationUpdate={(angle) => handleCameraRotationUpdate(angle, side)}
          isAutoRotationEnabled={isAutoRotationEnabled}
          toggleAutoRotation={toggleAutoRotation}
          currentCameraAngle={side === 'left' ? leftCameraAngle : rightCameraAngle}
          alwaysShowMap={true} // New prop to always show the map
          isFullScreenMode={isFullScreenMode && activeFullScreenSide === side}
        />
        
        {/* VR View Button for each side */}
        <Button 
  onClick={() => handleModeChange('vr', side)} 
  variant="contained" 
  color="primary"
  style={{
    position: 'absolute',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)', // Center horizontally
    zIndex: 1000,
    width: '200px', // Optional: reduced width
    padding: '6px 12px',
    fontSize: '12px'
  }}
>
  VR View
</Button>

      </div>
    );
  };

  // Add state for fullscreen mode
  const [isFullScreenMode, setIsFullScreenMode] = useState(false);
  const [activeFullScreenSide, setActiveFullScreenSide] = useState(null);
  
  // Store the original layout dimensions to restore after exiting fullscreen
  const [originalLayout, setOriginalLayout] = useState(null);

  // Function to handle ESC key press
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isFullScreenMode) {
        exitFullScreenMode();
      }
    };

    // Add event listener for keydown events
    window.addEventListener('keydown', handleEscKey);

    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [isFullScreenMode]); // Only re-run effect if isFullScreenMode changes

  // Function to exit fullscreen mode
  const exitFullScreenMode = () => {
    setIsFullScreenMode(false);
    setActiveFullScreenSide(null);
    
    // If we have a document element that's in fullscreen mode, exit that too
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => {
        console.error(`Error attempting to exit full-screen mode: ${err.message}`);
      });
    }
  };

  // Updated handleModeChange function to handle VR view switching with side parameter
  const handleModeChange = (mode, side) => {
    if (mode === 'vr') {
      // Store current layout before going fullscreen
      const mainContainer = document.querySelector('.main-container');
      if (mainContainer) {
        setOriginalLayout({
          width: mainContainer.offsetWidth,
          height: mainContainer.offsetHeight
        });
      }
      
      setIsFullScreenMode(true);
      setActiveFullScreenSide(side);
      console.log(`Switching to VR mode for ${side} side`);
      
      // Attempt to use the Fullscreen API if available
      const vrContainer = document.querySelector(`.vr-container-${side}`);
      if (vrContainer && vrContainer.requestFullscreen) {
        vrContainer.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable full-screen mode: ${err.message}`);
        });
      }
    }
  };

  // Render the full screen VR view
  const renderFullScreenVRView = () => {
    if (!isFullScreenMode) return null;

    // Determine which side's data to use
    const currentImageObj = activeFullScreenSide === 'left' 
      ? imagesLeft[currentIndexLeft] 
      : imagesRight[currentIndexRight];
    
    return (
      <div 
        className={`vr-container-${activeFullScreenSide}`}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 2000,
          backgroundColor: '#000',
        }}
      >
        
        
        <VRScene 
          imageUrl={currentImageObj?.image} 
          arrowDirection={arrowDirection} 
          setArrowDirection={setArrowDirection} 
          updateUserPosition={updateUserPosition}
          setCursorValues={setCursorValues}
          side={activeFullScreenSide}
          torchRotation={torchRotation}
          setTorchRotation={setTorchRotation}
          onCameraRotationUpdate={(angle) => handleCameraRotationUpdate(angle, activeFullScreenSide)}
          isAutoRotationEnabled={isAutoRotationEnabled}
          toggleAutoRotation={toggleAutoRotation}
          currentCameraAngle={activeFullScreenSide === 'left' ? leftCameraAngle : rightCameraAngle}
          alwaysShowMap={true}
          isFullScreenMode={true}
        />
        
        {/* Add floor map overlay in fullscreen mode too */}
        <FloorMapOverlay 
          rotation={0}
          userPosition={userPosition}
          side={activeFullScreenSide}
        />
        
        {/* Exit fullscreen button as an alternative to ESC key */}
        <Button 
          onClick={exitFullScreenMode} 
          variant="contained" 
          color="secondary"
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            zIndex: 2010,
          }}
        >
          Exit VR View
        </Button>
      </div>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <div
        className="main-container"
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "20px",
          position: "relative",
        }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
      
        {/* Split View - We'll hide this completely when in fullscreen mode instead of trying to adjust its contents */}
        <div 
          style={{ 
            display: isFullScreenMode ? 'none' : 'flex', 
            width: '100%', 
            height: '100%'
          }}
        >
          <div style={{ flex: 1, padding: '10px', position: 'relative' }}>
            <Typography variant="h6">Select Date</Typography>
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
              {renderImage(imagesLeft[currentIndexLeft], 'left')}
              <FloorMapOverlay 
                rotation={0} // Fixed to 0 so the map doesn't rotate
                userPosition={userPosition}
                side='left'
              />
            </div>
          </div>
          <div style={{ flex: 1, padding: '10px', position: 'relative' }}>
            <Typography variant="h6">Select Date</Typography>
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
              {renderImage(imagesRight[currentIndexRight], 'right')}
              <FloorMapOverlay 
                rotation={0} // Fixed to 0 so the map doesn't rotate
                userPosition={userPosition}
                side='right'
              />
            </div>
          </div>
        </div>

        
        {/* Display cursor movement values - always visible */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          backgroundColor: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          zIndex: isFullScreenMode ? 2010 : 1000,
        }}>
          <Typography variant="body2">
            Cursor Position: X: {cursorValues.x.toFixed(2)}, Y: {cursorValues.y.toFixed(2)}
          </Typography>
        </div>

        {/* Render fullscreen VR view */}
        {renderFullScreenVRView()}
      </div>
    </ThemeProvider>
  );  
};

const VRScene = ({ 
  imageUrl, 
  arrowDirection, 
  setArrowDirection, 
  setCursorValues,
  side,
  torchRotation,
  setTorchRotation,
  currentCameraAngle,
  isRotating,
  toggleRotation,
  updateFloorMapOrientation,
  updateUserPositionByAngle,
  onCameraRotationUpdate,
  alwaysShowMap = true
}) => {
  const vrSceneRef = useRef(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0, z: -2 });
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const mapRef = useRef(null);
  const [cameraRotation, setCameraRotation] = useState({ x: 0, y: 0, z: 0 });
  const [isMoving, setIsMoving] = useState(false);
  const [movementDirection, setMovementDirection] = useState(null);
  const lastMousePosition = useRef({ x: 0, y: 0 });
  const [sceneLoaded, setSceneLoaded] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(currentCameraAngle || 0);
  const frameId = useRef(null);
  const isInitialized = useRef(false);
  const resizeTimeoutRef = useRef(null);
  const textureRef = useRef(null);
  const sphereRef = useRef(null);
  const continuousRenderingRef = useRef(false);
  const loadingDivRef = useRef(null);
  
  // Force continuous rendering for a short duration
  const forceContinuousRendering = (duration = 1000) => {
    continuousRenderingRef.current = true;
    
    // Force immediate render
    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
    
    // Continue rendering for the specified duration
    setTimeout(() => {
      continuousRenderingRef.current = false;
    }, duration);
  };
  
  // Initialize Three.js scene once
  useEffect(() => {
    if (!vrSceneRef.current || isInitialized.current) return;
    
    isInitialized.current = true;
    
    // Create scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(75, vrSceneRef.current.clientWidth / vrSceneRef.current.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 0);
    cameraRef.current = camera;
    
    // Create renderer with transparent background instead of black
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(vrSceneRef.current.clientWidth, vrSceneRef.current.clientHeight);
    // Set to transparent instead of solid black
    renderer.setClearColor(0x000000, 0); 
    rendererRef.current = renderer;
    
    // Clean up any previous canvas
    while (vrSceneRef.current.firstChild) {
      vrSceneRef.current.removeChild(vrSceneRef.current.firstChild);
    }
    
    vrSceneRef.current.appendChild(renderer.domElement);
    
    // Create a loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'vr-scene-loading-indicator';
    loadingDiv.style.position = 'absolute';
    loadingDiv.style.top = '50%';
    loadingDiv.style.left = '50%';
    loadingDiv.style.transform = 'translate(-50%, -50%)';
    loadingDiv.style.color = 'white';
    loadingDiv.style.fontFamily = 'Arial, sans-serif';
    loadingDiv.style.fontSize = '16px';
    loadingDiv.style.background = 'rgba(0,0,0,0.5)';
    loadingDiv.style.padding = '10px 20px';
    loadingDiv.style.borderRadius = '5px';
    loadingDiv.style.zIndex = '1000';
    loadingDiv.textContent = 'Loading...';
    vrSceneRef.current.appendChild(loadingDiv);
    loadingDivRef.current = loadingDiv;
    
    // Create sphere geometry for 360 image
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1); // Invert the sphere so the texture renders on the inside
    
    // Create a temporary colored material to show while loading
    const tempMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x333333, 
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5
    });
    const sphere = new THREE.Mesh(geometry, tempMaterial);
    sphereRef.current = sphere;
    scene.add(sphere);
    
    // Load the texture with higher priority
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin('anonymous');
    
    // Pre-render with temp material to avoid blank screen
    renderer.render(scene, camera);
    
    const texture = textureLoader.load(
      imageUrl, 
      (loadedTexture) => {
        // Store texture reference
        textureRef.current = loadedTexture;
        textureRef.current.minFilter = THREE.LinearFilter;
        textureRef.current.magFilter = THREE.LinearFilter;
        textureRef.current.anisotropy = renderer.capabilities.getMaxAnisotropy();
        
        // Create final material with loaded texture
        const material = new THREE.MeshBasicMaterial({ 
          map: textureRef.current,
          side: THREE.DoubleSide
        });
        
        // Update sphere with new material
        sphere.material.dispose();
        sphere.material = material;
        
        // Safely remove loading indicator if it exists
        if (loadingDivRef.current && document.getElementById('vr-scene-loading-indicator')) {
          try {
            if (vrSceneRef.current && vrSceneRef.current.contains(loadingDivRef.current)) {
              vrSceneRef.current.removeChild(loadingDivRef.current);
            }
          } catch (err) {
            console.log("Loading indicator already removed");
          }
        }
        
        setSceneLoaded(true);
        
        // Force continuous rendering for a few seconds after loading
        forceContinuousRendering(3000);
        
        // Initial render after loading
        renderer.render(scene, camera);
      },
      // Progress callback
      (xhr) => {
        if (loadingDivRef.current) {
          const percent = Math.round(xhr.loaded / xhr.total * 100);
          loadingDivRef.current.textContent = `Loading: ${percent}%`;
          
          // Render during loading to avoid black screen
          renderer.render(scene, camera);
        }
      },
      // Error callback
      (error) => {
        console.error('Error loading texture:', error);
        if (loadingDivRef.current) {
          loadingDivRef.current.textContent = 'Error loading panorama';
        }
        setSceneLoaded(false);
      }
    );
    
    // Add cursor/reticle
    const cursorGeometry = new THREE.RingGeometry(0.02, 0.03, 32);
    const cursorMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const cursor = new THREE.Mesh(cursorGeometry, cursorMaterial);
    cursor.position.set(0, 0, -2);
    camera.add(cursor);
    scene.add(camera);
    
    // Set initial camera rotation to match current angle
    camera.rotation.y = THREE.MathUtils.degToRad(currentCameraAngle || 0);
    
    // Calculate initial rotation in degrees (0-360)
    const initialDegrees = (camera.rotation.y * 180 / Math.PI) % 360;
    const initialNormalizedDegrees = initialDegrees < 0 ? initialDegrees + 360 : initialDegrees;
    
    // Set initial rotation angle state
    setRotationAngle(initialNormalizedDegrees);
    
    // Update torch rotation immediately
    setTorchRotation(initialNormalizedDegrees);
    
    // Animation loop - ensure continuous rendering
    const animate = () => {
      frameId.current = requestAnimationFrame(animate);
      
      // Check if we should render this frame
      let shouldRender = false;
      
      // Always render during continuous rendering mode
      if (continuousRenderingRef.current) {
        shouldRender = true;
      }
      
      // Handle continuous rotation if enabled
      if (isRotating) {
        // Rotate camera by 0.5 degrees per frame
        camera.rotation.y += THREE.MathUtils.degToRad(0.5);
        
        // Calculate rotation in degrees (0-360)
        const degrees = (camera.rotation.y * 180 / Math.PI) % 360;
        const normalizedDegrees = degrees < 0 ? degrees + 360 : degrees;
        
        // Update rotation angle state
        setRotationAngle(normalizedDegrees);
        
        // Directly update torch rotation every frame during continuous rotation
        setTorchRotation(normalizedDegrees);
        
        // Notify parent components about camera rotation
        if (onCameraRotationUpdate) {
          onCameraRotationUpdate(normalizedDegrees);
        }
        
        // Update floor map orientation during rotation
        if (updateFloorMapOrientation) {
          updateFloorMapOrientation(normalizedDegrees);
        }
        
        shouldRender = true;
      }
      
      // Handle continuous movement if enabled
      if (isMoving && movementDirection) {
        // Calculate movement angle based on direction
        let angleInDegrees;
        switch (movementDirection) {
          case 'up':
            angleInDegrees = 0;
            break;
          case 'right':
            angleInDegrees = 90;
            break;
          case 'down':
            angleInDegrees = 180;
            break;
          case 'left':
            angleInDegrees = 270;
            break;
          default:
            angleInDegrees = 0;
        }
        
        // Update user position on floor map
        if (updateUserPositionByAngle) {
          updateUserPositionByAngle(angleInDegrees);
        }
        
        shouldRender = true;
      }
      
      // Render if needed
      if (shouldRender && renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    };
    
    animate();
    
    // Enhanced resize handler to prevent blank screens
    const handleResize = () => {
      if (!vrSceneRef.current || !renderer || !camera) return;
      
      // Clear any existing timeout
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      
      // Enable continuous rendering during resize
      forceContinuousRendering(1000);
      
      // Get new dimensions
      const width = vrSceneRef.current.clientWidth;
      const height = vrSceneRef.current.clientHeight;
      
      // Update camera
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      
      // Update renderer with new dimensions
      renderer.setSize(width, height);
      
      // Immediate render to prevent blank screen
      renderer.render(scene, camera);
      
      // Additional renders to ensure smooth transition
      resizeTimeoutRef.current = setTimeout(() => {
        renderer.render(scene, camera);
      }, 100);
    };
    
    // Improved orientation change handler
    const handleOrientationChange = () => {
      // Enable continuous rendering during orientation change
      forceContinuousRendering(2000);
      
      // Handle resize immediately
      handleResize();
      
      // Ensure multiple renders happen during orientation change
      for (let i = 1; i <= 5; i++) {
        setTimeout(() => {
          if (renderer && scene && camera) {
            renderer.render(scene, camera);
          }
        }, i * 200);
      }
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // Improved visibility change handler
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && renderer && scene && camera) {
        // Force continuous rendering when tab becomes visible again
        forceContinuousRendering(1000);
        handleResize();
        renderer.render(scene, camera);
      }
    });
    
    // Notify parent components about camera rotation on mount
    if (onCameraRotationUpdate) {
      onCameraRotationUpdate(initialNormalizedDegrees);
    }
    
    // Cleanup function
    return () => {
      isInitialized.current = false;
      if (frameId.current) cancelAnimationFrame(frameId.current);
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
      
      // Safely remove loading indicator if it still exists
      if (loadingDivRef.current && document.getElementById('vr-scene-loading-indicator')) {
        try {
          if (vrSceneRef.current && vrSceneRef.current.contains(loadingDivRef.current)) {
            vrSceneRef.current.removeChild(loadingDivRef.current);
          }
        } catch (err) {
          console.log("Loading indicator already removed");
        }
      }
      
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      document.removeEventListener('visibilitychange', handleOrientationChange);
      
      if (renderer) renderer.dispose();
      if (geometry) geometry.dispose();
      if (tempMaterial) tempMaterial.dispose();
      if (textureRef.current) textureRef.current.dispose();
      if (cursorGeometry) cursorGeometry.dispose();
      if (cursorMaterial) cursorMaterial.dispose();
      
      rendererRef.current = null;
      sceneRef.current = null;
      textureRef.current = null;
      sphereRef.current = null;
      loadingDivRef.current = null;
    };
  }, [imageUrl, currentCameraAngle, onCameraRotationUpdate, setTorchRotation]);
  
  // Mouse and touch event handlers with continuous rendering
  useEffect(() => {
    if (!vrSceneRef.current || !cameraRef.current || !rendererRef.current || !sceneRef.current) return;
    
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    
    // Flag for tracking active dragging
    let isDragging = false;
    
    const handleMouseDown = (e) => {
      isDragging = true;
      lastMousePosition.current = { x: e.clientX, y: e.clientY };
      
      // Enable continuous rendering during drag
      forceContinuousRendering(500);
    };
    
    const handleMouseUp = () => {
      isDragging = false;
      
      // Ensure one final render after drag ends
      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    };
    
    const handleMouseMove = (e) => {
      // Ensure we render during mouse movement to avoid blank screens
      if (renderer && scene && camera) {
        forceContinuousRendering(300);
      }
      
      if (e.buttons === 1 && !isRotating) { // Left mouse button down and not in auto-rotation mode
        const deltaX = e.clientX - lastMousePosition.current.x;
        const deltaY = e.clientY - lastMousePosition.current.y;
        
        // Only adjust if there's significant movement
        if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
          // Convert mouse movement to rotation
          camera.rotation.y -= deltaX * 0.005;
          camera.rotation.x -= deltaY * 0.005;
          
          // Clamp vertical rotation
          camera.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, camera.rotation.x));
          
          // Update rotation state
          setCameraRotation({
            x: camera.rotation.x,
            y: camera.rotation.y,
            z: camera.rotation.z,
          });
          
          // Calculate rotation in degrees (0-360)
          const degrees = (camera.rotation.y * 180 / Math.PI) % 360;
          const normalizedDegrees = degrees < 0 ? degrees + 360 : degrees;
          
          // Update rotation angle state
          setRotationAngle(normalizedDegrees);
          
          // Directly update torch rotation
          setTorchRotation(normalizedDegrees);
          
          // Notify parent components about camera rotation
          if (onCameraRotationUpdate) {
            onCameraRotationUpdate(normalizedDegrees);
          }
          
          // Update floor map orientation
          if (updateFloorMapOrientation) {
            updateFloorMapOrientation(normalizedDegrees);
          }
          
          // Force render during manual rotation
          renderer.render(scene, camera);
        }
        
        lastMousePosition.current = { x: e.clientX, y: e.clientY };
      }
      
      // Update cursor values for display
      const rect = vrSceneRef.current.getBoundingClientRect();
      const normalizedX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normalizedY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      
      setCursorValues({ x: normalizedX, y: normalizedY });
    };
    
    const handleClick = () => {
      // Force render on click
      forceContinuousRendering(500);
      
      if (arrowDirection) {
        // Calculate movement angle based on direction
        let angleInDegrees;
        switch (arrowDirection) {
          case 'up':
            angleInDegrees = 0;
            break;
          case 'right':
            angleInDegrees = 90;
            break;
          case 'down':
            angleInDegrees = 180;
            break;
          case 'left':
            angleInDegrees = 270;
            break;
          default:
            angleInDegrees = 0;
        }
        
        // Update user position on floor map
        if (updateUserPositionByAngle) {
          updateUserPositionByAngle(angleInDegrees);
        }
      }
    };
    
    const handleKeyDown = (e) => {
      // Force render on key press
      forceContinuousRendering(500);
      
      let direction = null;
      
      switch (e.key) {
        case 'ArrowUp':
          direction = 'up';
          setMovementDirection('up');
          setIsMoving(true);
          break;
        case 'ArrowDown':
          direction = 'down';
          setMovementDirection('down');
          setIsMoving(true);
          break;
        case 'ArrowLeft':
          direction = 'left';
          setMovementDirection('left');
          setIsMoving(true);
          break;
        case 'ArrowRight':
          direction = 'right';
          setMovementDirection('right');
          setIsMoving(true);
          break;
        case 'r':
          // Keep the rotation toggle functionality
          toggleRotation();
          break;
      }
    };
    
    const handleKeyUp = (e) => {
      setIsMoving(false);
      
      // Final render after key release
      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    };
    
    // Touch event handlers for mobile with continuous rendering
    const handleTouchStart = (e) => {
      isDragging = true;
      if (e.touches.length === 1) {
        lastMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        
        // Enable continuous rendering during touch
        forceContinuousRendering(500);
      }
    };
    
    const handleTouchEnd = () => {
      isDragging = false;
      
      // Ensure one final render after touch ends
      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    };
    
    const handleTouchMove = (e) => {
      // Force continuous rendering during touch movement
      forceContinuousRendering(300);
      
      if (e.touches.length === 1 && !isRotating) {
        const deltaX = e.touches[0].clientX - lastMousePosition.current.x;
        const deltaY = e.touches[0].clientY - lastMousePosition.current.y;
        
        // Convert touch movement to rotation
        camera.rotation.y -= deltaX * 0.005;
        camera.rotation.x -= deltaY * 0.005;
        
        // Clamp vertical rotation
        camera.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, camera.rotation.x));
        
        // Update rotation state
        setCameraRotation({
          x: camera.rotation.x,
          y: camera.rotation.y,
          z: camera.rotation.z,
        });
        
        // Calculate rotation in degrees (0-360)
        const degrees = (camera.rotation.y * 180 / Math.PI) % 360;
        const normalizedDegrees = degrees < 0 ? degrees + 360 : degrees;
        
        // Update rotation angle state
        setRotationAngle(normalizedDegrees);
        
        // Directly update torch rotation
        setTorchRotation(normalizedDegrees);
        
        // Notify parent components about camera rotation
        if (onCameraRotationUpdate) {
          onCameraRotationUpdate(normalizedDegrees);
        }
        
        // Update floor map orientation
        if (updateFloorMapOrientation) {
          updateFloorMapOrientation(normalizedDegrees);
        }
        
        // Force render after touch rotation
        renderer.render(scene, camera);
        
        lastMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    
    // Attach event listeners
    vrSceneRef.current.addEventListener('mousedown', handleMouseDown);
    vrSceneRef.current.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    vrSceneRef.current.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    vrSceneRef.current.addEventListener('touchstart', handleTouchStart);
    vrSceneRef.current.addEventListener('touchmove', handleTouchMove);
    vrSceneRef.current.addEventListener('touchend', handleTouchEnd);
    
    // Cleanup function
    return () => {
      if (vrSceneRef.current) {
        vrSceneRef.current.removeEventListener('mousedown', handleMouseDown);
        vrSceneRef.current.removeEventListener('mousemove', handleMouseMove);
        vrSceneRef.current.removeEventListener('click', handleClick);
        vrSceneRef.current.removeEventListener('touchstart', handleTouchStart);
        vrSceneRef.current.removeEventListener('touchmove', handleTouchMove);
        vrSceneRef.current.removeEventListener('touchend', handleTouchEnd);
      }
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      
      isDragging = false;
    };
  }, [arrowDirection, setArrowDirection, setCursorValues, isRotating, onCameraRotationUpdate, updateUserPositionByAngle, setTorchRotation, updateFloorMapOrientation]);
  
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
      {/* VR Scene container */}
      <div 
        ref={vrSceneRef} 
        style={{ 
          width: "100%", 
          height: "100%",
          backgroundColor: "transparent", // Transparent background instead of black
          position: "absolute",
          top: 0,
          left: 0
        }}
      ></div>
      
      {/* Rotation indicator */}
      <div style={{
        position: "absolute",
        top: "10px",
        left: "10px",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        color: "white",
        padding: "5px 10px",
        borderRadius: "4px",
        fontSize: "14px",
        zIndex: 1002,
        boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
      }}>
        Angle: {Math.round(rotationAngle)}°
      </div>
      
      {/* Floor map container */}
      <div style={{
        position: "absolute",
        bottom: "20px",
        right: "20px",
        pointerEvents: "none",
        zIndex: 1002,
        opacity: alwaysShowMap ? 1 : 0,
        transition: "opacity 0.2s ease-in-out",
      }}>
        {/* Floor map component would go here if needed */}
      </div>
    </div>
  );
};

export default ImageGalleryComponent;