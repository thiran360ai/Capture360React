import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Typography from "@mui/material/Typography";
import LineGraph from "./LineGraph";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import arrowimg from './arrow-icon-1182.png'
import * as THREE from 'three'
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
  const [is360View, setIs360View] = useState(false);
  const [dateToIdMap, setDateToIdMap] = useState({});
  const [imageUrlLeft, setImageUrlLeft] = useState("");
  const [imageUrlRight, setImageUrlRight] = useState("");
  const [arrowDirection, setArrowDirection] = useState("up"); // Initial arrow direction
  const vrSceneRef = useRef(null); // Reference to the VR scene

  useEffect(() => {
    if (id) {
      fetchDates(id);
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

  const points = [
    { x: 1, y: 1 },
    { x: 2, y: 2 },
    { x: 3, y: 3 },
    { x: 4, y: 4 },
    { x: 5, y: 5 },
  ];
  const [jsonid, setJsonid] = useState();


  const fetchImages = async (id, date, isRight) => {
    try {
      const frameId = dateToIdMap[date];
      if (!frameId) {
        console.error("No frame ID found for the selected date.");
        isRight ? setImagesRight([]) : setImagesLeft([]);
        return;
      }

      const response = await fetch(
        `http://59.97.51.97:8081/building/api/video-frames/plan/${id}/video/${frameId}/`,
        {
          headers: {
            Accept: "application/json",
            "ngrok-skip-browser-warning": "98547",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const imageData = await response.json();
      setJsonid(imageData[0].json)
      if (Array.isArray(imageData)) {
        const validImages = imageData.filter(
          (image) => image && image.image
        );
        if (isRight) {
          setImagesRight(validImages);
          setCurrentIndexRight(0);
          setImageUrlRight(validImages[0]?.image ? `http://59.97.51.97:8081/${validImages[0].image}` : "");
        } else {
          setImagesLeft(validImages);
          setCurrentIndexLeft(0);
          setImageUrlLeft(validImages[0]?.image ? `http://59.97.51.97:8081/${validImages[0].image}` : "");
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
  
  // Main Component
  const ImageGalleryComponent = () => {
    // All existing states and functions...
  
    return (
      <ThemeProvider theme={theme}>
        <div
          style={{
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "20px",
          }}
        >
          {is360View && (
  <div style={{ width: "100%", height: "100%" }}>
    <Typography variant="h6" style={{ marginBottom: "10px" }}>
      VR View
    </Typography>
    <Select
      value={selectedDateLeft}
      onChange={(e) => {
        const newDate = e.target.value;
        setSelectedDateLeft(newDate);
        fetchImages(id, newDate, false);
      }}
      fullWidth
    >
      {dates.map((date) => (
        <MenuItem key={date} value={date}>
          {date}
        </MenuItem>
      ))}
    </Select>
    <div style={{ height: "70vh", marginTop: "10px" }}>
      <VRScene imageUrl={imageUrlLeft} arrowDirection={arrowDirection} />
    </div>
    <div style={{ marginTop: "20px", width: "100%" }}>
      <Typography variant="h6" style={{ marginBottom: "10px" }}>
        Graph Visualization
      </Typography>
    </div>
  </div>
)}

        </div>
      </ThemeProvider>
    );
  };
  const fetchDates = async (id) => {
    try {
      const response = await fetch(
        `http://59.97.51.97:8081/building/api/video-frames/plan/${id}/`,
        {
          headers: {
            Accept: "application/json",
            "ngrok-skip-browser-warning": "98547",
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
    setCurrentIndexLeft((currentIndexLeft + 1) % imagesLeft.length);
    setCurrentIndexRight((currentIndexRight + 1) % imagesRight.length);
  };

  const handleNextRight = () => {
    setCurrentIndexRight((currentIndexRight + 1) % imagesRight.length);
    setCurrentIndexLeft((currentIndexLeft + 1) % imagesLeft.length);
  };

  const handlePrevLeft = () => {
    setCurrentIndexLeft((currentIndexLeft - 1 + imagesLeft.length) % imagesLeft.length);
    setCurrentIndexRight((currentIndexRight - 1 + imagesRight.length) % imagesRight.length);
  };

  const handlePrevRight = () => {
    setCurrentIndexLeft((currentIndexLeft - 1 + imagesLeft.length) % imagesLeft.length);
    setCurrentIndexRight((currentIndexRight - 1 + imagesRight.length) % imagesRight.length);
  };

  const handlePause = () => {
    setIsPaused((prevIsPaused) => !prevIsPaused);
  };

  const handleImageClick = () => {
    setIsPaused(true);
  };

  const handleModeChange = (mode) => {
    if (mode === 'split') {
      setIs360View(false);
      setIsSplitScreen(true);
    } else if (mode === 'vr') {
      setIs360View(true);
      setIsSplitScreen(false);
    }
  };

  useEffect(() => {
    if (is360View) {
      const newImageUrl = imageUrlLeft;
      setImageUrlLeft(newImageUrl);
    }
  }, [selectedDateLeft, is360View]);

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

    const url = `http://59.97.51.97:8081/${imageObj.image}`;
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
        <VRScene imageUrl={url} arrowDirection={arrowDirection} setArrowDirection={setArrowDirection} />
        {/* <img
          src={url}
          alt="Gallery"
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
            cursor: "pointer",
          }}
          
          onClick={handleImageClick}
        /> */}
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
        }}
      >
        {/* <ButtonGroup variant="contained" aria-label="outlined primary button group"> */}
          {/* <Button onClick={() => handleModeChange('split')}>Split Screen</Button> */}
          {/* <Button onClick={() => handleModeChange('vr')}>VR View</Button> */}
        {/* </ButtonGroup> */}

        {isSplitScreen && (
          <div style={{ display: 'flex', width: '100%', height: '100%' }}>
            <div style={{ flex: 1, padding: '10px' }}>
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
              <div style={{ height: '70vh', marginTop: '10px' }}>
                {renderImage(imagesLeft[currentIndexLeft])}
              </div>
            </div>
            <div style={{ flex: 1, padding: '10px' }}>
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
              {/* <ButtonGroup
                variant="contained"
                aria-label="outlined primary button group"
                style={{ marginTop: '10px' }}
              >
                <Button onClick={handlePrevRight}>Previous</Button>
                <Button onClick={handlePause}>{isPaused ? 'Play' : 'Pause'}</Button>
                <Button onClick={handleNextRight}>Next</Button>
              </ButtonGroup> */}
              <div style={{ height: '70vh', marginTop: '10px' }}>
                {renderImage(imagesRight[currentIndexRight])}
              </div>
            </div>
          </div>
        )}

       {is360View && (
          <div style={{ width: '100%', height: '100%' }}>
            <Typography variant="h6">VR View</Typography>
            <Select
              value={selectedDateLeft}
              onChange={(e) => {
                const newDate = e.target.value;
                setSelectedDateLeft(newDate);
                fetchImages(id, newDate, false);
              }}
              fullWidth
            >
              {dates.map(date => (
                <MenuItem key={date} value={date}>
                  {date}
                </MenuItem>
              ))}
            </Select>
            <div style={{ height: '80vh', marginTop: '10px' }}>
              <VRScene imageUrl={imageUrlLeft} arrowDirection={arrowDirection} />
              {/* <Scene360View imageUrl={imageUrlLeft} /> */}
            

            </div>
            
          </div>
        )}
        {jsonid && (
  <LineGraph
    id={jsonid}
    setCurrentIndexLeft={setCurrentIndexLeft}
    setCurrentIndexRight={setCurrentIndexRight}
    maxFrames={Math.min(imagesLeft.length, imagesRight.length)}
  />
)}
      </div>
    </ThemeProvider>
  );  
};

const VRScene = ({ imageUrl, arrowDirection, setArrowDirection, followImageUrl }) => {
  const [skySrc, setSkySrc] = useState('');  // For the background VR image
  const vrSceneRef = useRef(null);           // Reference to the VR scene
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0, z: -2 }); // Initial cursor position with depth

  useEffect(() => {
    // Fetching the background image (360-degree)
    const fetchImages = async () => {
      try {
        const response = await fetch(imageUrl, {
          headers: {
            Accept: "application/json",
            "ngrok-skip-browser-warning": "98547",
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          setSkySrc(reader.result);  // Set the Base64 string as the source for sky
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error('Error fetching image:', error);
        setSkySrc(imageUrl);  // Fallback to direct URL if needed
      }
    };
    fetchImages();
  }, [imageUrl]);

  const handleMouseMove = (event) => {
    // Get normalized screen coordinates (range: -1 to 1)
    const x = (event.clientX / window.innerWidth) * 2 - 1;  // Normalize x position
    const y = -(event.clientY / window.innerHeight) * 2 + 1;  // Normalize y position

    // Calculate the 3D position based on normalized 2D coordinates and map them to a closer depth (Z-axis)
    const z = -2; // A fixed Z distance to keep the arrow image in view (can be adjusted)

    // Update cursor position in 3D space
    setCursorPos({ x, y, z });

    // Detect movement direction and set arrow direction
    if (Math.abs(event.movementX) > Math.abs(event.movementY)) {
      setArrowDirection(event.movementX > 0 ? "right" : "left");
    } else {
      setArrowDirection(event.movementY > 0 ? "down" : "up");
    }
  };

  const ArrowComponent = ({ direction }) => {
    const arrowStyle = {
      position: 'absolute',
      top: `${cursorPos.y * 0 + 50}%`,  // Adjust to center the arrow on the cursor
      left:`${cursorPos.x * 0 + 50}%`,  // Adjust to center the arrow on the cursor
      zIndex: 10,
      fontSize: '24px',
      fontWeight: 'bold',
      backgroundColor: 'transparent',
      pointerEvents: 'none',  // So it doesn't interfere with mouse events
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
      onMouseMove={handleMouseMove} // Track cursor movement
      style={{ height: "100%", width: "100%", position: "relative", cursor: "none" }}  // "none" hides default cursor for custom effect
    >
      <a-scene
        embedded
        vr-mode-ui="enabled: true"
        style={{ height: '100%', width: '100%' }}
      >
        {/* Skybox (360 background) */}
        <a-sky src={skySrc} rotation="0 0 0"></a-sky>

        {/* Lighting */}
        <a-light type="ambient" color="#888"></a-light>
        <a-light type="directional" position="-1 1 0" color="#FFF"></a-light>

        {/* Arrow Image following the cursor in 3D */}
        <a-image
          src={arrowimg}   // Image that follows the cursor
          position={`${cursorPos.x * 3} ${cursorPos.y * 3} ${cursorPos.z }`} // Update position dynamically in 3D space
          width="0.5" height="0.5"   // Adjust size of the image to be smaller
          rotation="0 0 0"         // Adjust rotation to face the viewer if necessary
          look-at="[camera]"       // Always face the camera
        ></a-image>
      </a-scene>

      {/* ArrowComponent showing direction */}
      <ArrowComponent direction={arrowDirection} />

      {/* Debugging: Show cursor position */}
      <div style={{ position: "absolute", bottom: "10px", left: "10px", color: "white" }}>
        Cursor Position: x: {cursorPos.x.toFixed(2)}, y: {cursorPos.y.toFixed(2)}, z: {cursorPos.z.toFixed(2)}
      </div>
    </div>
  );
};

export default ImageGalleryComponent;
