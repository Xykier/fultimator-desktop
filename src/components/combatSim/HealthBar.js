import React from "react";
import { Box, LinearProgress, Typography } from "@mui/material";

const HealthBar = ({ label, currentValue, maxValue, startColor, endColor, bgColor }) => {
  const percentage = (currentValue / maxValue) * 100 || 0;
  
  // Create a gradient from startColor to endColor
  const gradient = `linear-gradient(to right, ${startColor}, ${endColor})`;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        marginBottom: 2,
        border: "2px solid #e0e0e0", // Border around the label and progress bar
      }}
    >
      {/* Label */}
      <Box
        sx={{
          backgroundColor: "#f4f4f4",
          borderRight: "1px solid #e0e0e0",
          width: "10%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 25,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: "bold",
            fontFamily: "'Press Start 2P', cursive",
          }}
        >
          {label}
        </Typography>
      </Box>

      {/* Progress Bar */}
      <Box sx={{ position: "relative", width: "90%" }}>
        <LinearProgress
          variant="determinate"
          value={percentage}
          sx={{
            height: 25,
            borderRadius: 0,
            backgroundColor: bgColor || "#e0e0e0", // Use bgColor prop for background
            "& .MuiLinearProgress-bar": {
              borderRadius: 0,
              background: gradient, // Apply the gradient
            },
          }}
        />
        {/* Value inside the bar */}
        <Typography
          variant="body2"
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontWeight: "bold",
            color: "#fff",
            fontFamily: "'Press Start 2P', cursive",
          }}
        >
          {`${currentValue} / ${maxValue}`}
        </Typography>
      </Box>
    </Box>
  );
};

export default HealthBar;
