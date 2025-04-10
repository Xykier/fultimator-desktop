import React, { useState } from "react";
import { useTheme } from "@mui/material/styles";

function calculateCoordinates(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = (angleInDegrees - 90) * (Math.PI / 180);

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

const Clock = ({ numSections, size, state, setState, isCharacterSheet }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  
  // Colors based on dark or light mode
  const primary = isDarkMode ? theme.palette.primary.light : theme.palette.primary.main;
  const secondary = isDarkMode ? theme.palette.secondary.light : theme.palette.secondary.main;
  const strokeColor = theme.palette.text.primary;
  const hoveredActiveColor = theme.palette.info.main; // Info color for hover

  const [hoveredIndex, setHoveredIndex] = useState(null);

  const handleClick = (index) => {
    const updatedSections = [...state];
    updatedSections[index] = !updatedSections[index];
    setState(updatedSections);
  };

  const handleMouseEnter = (index) => {
    if (!isCharacterSheet) {
      setHoveredIndex(index);
    }
  };

  const handleMouseLeave = () => {
    if (!isCharacterSheet) {
      setHoveredIndex(null);
    }
  };

  const sections = [];
  for (let i = 0; i < numSections; i++) {
    const startAngle = (360 / numSections) * i;
    const endAngle = (360 / numSections) * (i + 1);

    const startPoint = calculateCoordinates(size / 2, size / 2, size / 2, startAngle);
    const endPoint = calculateCoordinates(size / 2, size / 2, size / 2, endAngle);

    const pathData = `
      M ${size / 2},${size / 2}
      L ${startPoint.x},${startPoint.y}
      A ${size / 2},${size / 2} 0 ${endAngle - startAngle > 180 ? 1 : 0},1 ${endPoint.x},${endPoint.y}
      Z
    `;

    const isHovered = hoveredIndex === i;
    const isActive = state[i];
    let fill = "transparent";

    if (isCharacterSheet) {
      fill = isActive ? primary : "transparent";
    } else {
      if (isHovered && isActive) {
        fill = hoveredActiveColor;
      } else if (isHovered) {
        fill = secondary;
      } else if (isActive) {
        fill = primary;
      }
    }

    sections.push(
      <path
        key={i}
        d={pathData}
        fill={fill}
        stroke={strokeColor}
        strokeWidth="1"
        onClick={() => handleClick(i)}
        onMouseEnter={() => handleMouseEnter(i)}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: isCharacterSheet ? "default" : "pointer" }}
      />
    );
  }

  return (
    <svg width={size} height={size}>
      {sections}
    </svg>
  );
};

export default Clock;
