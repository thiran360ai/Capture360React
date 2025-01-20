import React, { useEffect, useState, useRef } from "react";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

const ImageGalleryComponent = () => {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [circles, setCircles] = useState({});
  const [isSplit, setIsSplit] = useState(false);
  const canvasRefs = [useRef(null), useRef(null)];
  const imageRefs = [useRef(null), useRef(null)];

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch(
          "http://59.97.51.97:8081/building/video/2/frames/",
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
        console.log("Full API Response:", imageData);

        if (imageData && imageData.frames) {
          console.log("Fetched Image Data:", imageData.frames);
          setImages(imageData.frames);
        } else {
          console.warn("Unexpected API response structure:", imageData);
        }
      } catch (error) {
        console.error("Failed to fetch images:", error);
      }
    };

    fetchImages();
  }, []);

  useEffect(() => {
    if (!isPaused) {
      const intervalId = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 3000); // Change image every 3 seconds

      return () => clearInterval(intervalId); // Cleanup interval on component unmount
    }
  }, [images.length, isPaused]);

  const handleNext = () => {
    setCurrentIndex((currentIndex + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((currentIndex - 1 + images.length) % images.length);
  };

  const handleEdit = () => {
    setIsEditing((prevEditing) => {
      const newEditingState = !prevEditing;
      setIsPaused(newEditingState); // Pause the slideshow if entering edit mode
      return newEditingState;
    });
  };

  const handleImageClick = () => {
    if (isEditing) {
      setIsEditing(false); // Exit editing mode on image click
      setIsPaused(false); // Resume the slideshow
    }
  };

  const drawCircle = (ctx, x, y) => {
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, 2 * Math.PI);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const handleCanvasClick = (e, index) => {
    if (isEditing) {
      const canvas = canvasRefs[index].current;
      const ctx = canvas.getContext("2d");
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      drawCircle(ctx, x, y);
      setCircles((prevCircles) => {
        const newCircles = { ...prevCircles };
        if (!newCircles[currentIndex + index]) {
          newCircles[currentIndex + index] = [];
        }
        newCircles[currentIndex + index].push({ x, y });
        return newCircles;
      });
    }
  };

  const renderImage = (imageObj, name, index) => {
    const url = `http://59.97.51.97:8081/${imageObj.url}`;
    console.log("Constructed Image URL:", url);
    return (
      <div style={{ position: "relative" }}>
        <img
          ref={imageRefs[index]}
          key={imageObj.url}
          src={url}
          alt={name}
          style={{
            width: "100%",
            height: "auto",
            margin: "5px",
            cursor: isEditing ? "pointer" : "default",
          }}
          onClick={handleImageClick}
          onError={(e) => (e.target.style.display = "none")}
          onLoad={() => {
            const canvas = canvasRefs[index].current;
            if (canvas && imageRefs[index].current) {
              canvas.width = imageRefs[index].current.offsetWidth;
              canvas.height = imageRefs[index].current.offsetHeight;
              const ctx = canvas.getContext("2d");
              if (circles[currentIndex + index]) {
                circles[currentIndex + index].forEach((circle) =>
                  drawCircle(ctx, circle.x, circle.y)
                );
              }
            }
          }}
        />
        <canvas
          ref={canvasRefs[index]}
          onClick={(e) => handleCanvasClick(e, index)}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: isEditing ? "auto" : "none",
          }}
        />
      </div>
    );
  };

  const handleSplit = () => {
    setIsSplit(!isSplit);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <Typography variant="h4" gutterBottom>
        360 Degree Image Gallery
      </Typography>
      {images.length > 0 ? (
        <div
          style={{
            display: "flex",
            flexDirection: isSplit ? "row" : "column",
            justifyContent: "center",
            alignItems: "center",
            flexWrap: isSplit ? "wrap" : "nowrap",
          }}
        >
          <div
            style={{
              position: "relative",
              width: isSplit ? "45%" : "100%",
              maxWidth: "600px",
              margin: isSplit ? "10px" : "auto",
            }}
          >
            {renderImage(
              images[currentIndex],
              `360 Degree Image ${currentIndex}`,
              0
            )}
            <Button
              variant="contained"
              color="primary"
              onClick={handlePrev}
              style={{
                position: "absolute",
                top: "50%",
                left: "0",
                transform: "translateY(-50%)",
              }}
            >
              Previous
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              style={{
                position: "absolute",
                top: "50%",
                right: "0",
                transform: "translateY(-50%)",
              }}
            >
              Next
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setIsPaused(!isPaused)}
              style={{
                position: "absolute",
                top: "90%",
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >
              {isPaused ? "Resume" : "Pause"}
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleEdit}
              style={{
                position: "absolute",
                top: "90%",
                right: "0",
                transform: "translateY(-50%)",
              }}
            >
              {isEditing ? "Stop Editing" : "Edit"}
            </Button>
          </div>
          {isSplit && (
            <div
              style={{
                position: "relative",
                width: "45%",
                maxWidth: "600px",
                margin: "10px",
              }}
            >
              {renderImage(
                images[(currentIndex + 1) % images.length],
                `360 Degree Image ${(currentIndex + 1) % images.length}`,
                1
              )}
            </div>
          )}
        </div>
      ) : (
        <Typography>Loading images...</Typography>
      )}
      <Button
        variant="contained"
        color="primary"
        onClick={() => window.history.back()}
        style={{ marginTop: "20px" }}
      >
        Back
      </Button>
      <Button
        variant="contained"
        color="secondary"
        onClick={handleSplit}
        style={{ marginTop: "20px", marginLeft: "10px" }}
      >
        {isSplit ? "Unsplit" : "Split"}
      </Button>
    </div>
  );
};

export default ImageGalleryComponent;
