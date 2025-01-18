import React from "react";

const ArrowUp = () => <div style={{ transform: 'rotate(0deg)' }}>↑</div>;
const ArrowDown = () => <div style={{ transform: 'rotate(180deg)' }}>↓</div>;
const ArrowLeft = () => <div style={{ transform: 'rotate(-90deg)' }}>←</div>;
const ArrowRight = () => <div style={{ transform: 'rotate(90deg)' }}>→</div>;

const DirectionArrows = ({ direction }) => {
  if (!direction) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: `translate(-50%, -50%)`,
        pointerEvents: "none",
        zIndex: 1000,
      }}
    >
      {direction === "up" && <ArrowUp />}
      {direction === "down" && <ArrowDown />}
      {direction === "left" && <ArrowLeft />}
      {direction === "right" && <ArrowRight />}
    </div>
  );
};

export default DirectionArrows;
