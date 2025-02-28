import React from "react";
import { Box } from "@mui/material";

const AttributeSection = ({ selectedNPC, calcAttr }) => {
  const attributes = [
    {
      label: "DEX",
      value: calcAttr("Slow", "Enraged", "dexterity", selectedNPC),
      color: "#42a5f5",
      originalValue: selectedNPC.attributes?.dexterity,
    },
    {
      label: "INT",
      value: calcAttr("Dazed", "Enraged", "insight", selectedNPC),
      color: "#ab47bc",
      originalValue: selectedNPC.attributes?.insight,
    },
    {
      label: "MIG",
      value: calcAttr("Weak", "Poisoned", "might", selectedNPC),
      color: "#ff7043",
      originalValue: selectedNPC.attributes?.might,
    },
    {
      label: "WLP",
      value: calcAttr("Shaken", "Poisoned", "will", selectedNPC),
      color: "#e8b923",
      originalValue: selectedNPC.attributes?.will,
    },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        borderTop: "1px solid #ccc",
        paddingY: 1,
        bgcolor: "#f5f5f5",
      }}
    >
      {attributes.map((attr) => (
        <Box
          key={attr.label}
          sx={{
            display: "flex",
            alignItems: "center",
            borderRadius: "16px",
            overflow: "hidden",
            bgcolor: "#e0e0e0",
          }}
        >
          {/* Label Part */}
          <Box
            sx={{
              bgcolor: attr.color,
              color: "white",
              paddingX: 1,
              paddingY: 0.5,
              fontWeight: "bold",
              fontSize: "1rem",
            }}
          >
            {attr.label}
          </Box>
          {/* Value Part */}
          <Box
            sx={{
              paddingX: 1.5,
              paddingY: 0.5,
              fontSize: "1rem",
              fontWeight: "bold",
              color:
                attr.value === attr.originalValue
                  ? "inherit"
                  : attr.value > attr.originalValue
                  ? "green !important"
                  : "red !important",
            }}
          >
            {attr.value}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default AttributeSection;
