import React from "react";
import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";

const HeaderContainer = styled(Box)(({ theme }) => ({
    position: "relative",
    height: 120,
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.palette.mode === "dark" ? theme.palette.grey[900] : theme.palette.grey[100],
    borderBottom: `1px solid ${theme.palette.divider}`,
  }));
  

const CardImage = styled("img")({
  width: "auto", // Changed from 100% to auto
  height: "100%", // Keep height at 100%
  maxWidth: "100%", // Ensure image doesn't overflow container width
  maxHeight: "100%", // Ensure image doesn't overflow container height
  objectFit: "contain", // Changed from cover to contain
  objectPosition: "center",
  transition: "transform 0.3s ease",
  "&:hover": {
    transform: "scale(1.05)",
  },
});

const NpcCardHeader = ({ imageUrl }) => {
  const defaultImage = "/logo192.png";

  return (
    <HeaderContainer>
      <CardImage
        src={imageUrl || defaultImage}
        alt="NPC"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = defaultImage;
        }}
      />
    </HeaderContainer>
  );
};

export default NpcCardHeader;
