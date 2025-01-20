import React, { useState, useRef, useEffect } from 'react';

const VRScene = ({ imageUrl, arrowDirection, setArrowDirection }) => {
  const [skySrc, setSkySrc] = useState('');
  const vrSceneRef = useRef(null); // Reference to the VR scene

  useEffect(() => {
    const fetchImage = async () => {
      console.log("Fetching image data...");
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
          setSkySrc(reader.result); // Set the Base64 string as the source
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error('Error fetching image:', error);
        setSkySrc(imageUrl); // Fallback to direct URL if needed
      }
    };

    fetchImage();

    // Add mouse events to handle arrow direction
    const handleMouseMove = (event) => {
      const { clientX, clientY } = event;
      const { width, height } = vrSceneRef.current.getBoundingClientRect();
      const x = (clientX - (width / 2)) / (width / 2);
      const y = (clientY - (height / 2)) / (height / 2);

      if (y > 0.5) {
        setArrowDirection("down");
      } else if (y < -0.5) {
        setArrowDirection("up");
      } else if (x > 0.5) {
        setArrowDirection("right");
      } else if (x < -0.5) {
        setArrowDirection("left");
      }
    };

    const scene = vrSceneRef.current;
    if (scene) {
      scene.addEventListener('mousemove', handleMouseMove);
    }

    // Clean up event listener on unmount
    return () => {
      if (scene) {
        scene.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [imageUrl, setArrowDirection]);

  return (
    <a-scene
      embedded
      vr-mode-ui="enabled: true"
      style={{ height: '100%', width: '100%' }}
      ref={vrSceneRef}
    >
      <a-sky src={skySrc} rotation="0 0 0"></a-sky>
      <a-light type="ambient" color="#888"></a-light>
      <a-light type="directional" position="-1 1 0" color="#FFF"></a-light>

      {/* Display arrow based on the direction */}
      {arrowDirection === "up" && (
        <a-entity position="0 1.5 -2" geometry="primitive: cone; height: 0.5; radiusBottom: 0.1" material="color: yellow" rotation="0 0 180"></a-entity>
      )}
      {arrowDirection === "down" && (
        <a-entity position="0 -1.5 -2" geometry="primitive: cone; height: 0.5; radiusBottom: 0.1" material="color: yellow" rotation="0 0 0"></a-entity>
      )}
      {arrowDirection === "left" && (
        <a-entity position="-1.5 0 -2" geometry="primitive: cone; height: 0.5; radiusBottom: 0.1" material="color: yellow" rotation="0 90 90"></a-entity>
      )}
      {arrowDirection === "right" && (
        <a-entity position="1.5 0 -2" geometry="primitive: cone; height: 0.5; radiusBottom: 0.1" material="color: yellow" rotation="0 -90 -90"></a-entity>
      )}
    </a-scene>
  );
};

export default VRScene;
