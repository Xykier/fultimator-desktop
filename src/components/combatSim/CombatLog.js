import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  Collapse,
  Paper,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { format, isToday } from "date-fns";
import { useTheme } from "@mui/material/styles";
import DragHandleIcon from "@mui/icons-material/DragHandle"; // Handle icon
import { TypeIcon } from "../../components/types";
import {
  DistanceIcon,
  MeleeIcon,
  OffensiveSpellIcon,
  SpellIcon,
} from "../icons.js";
import { GiDeathSkull } from "react-icons/gi";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import { t } from "../../translation/translate";

// Define the mapping of tags to components
const tagMap = {
  "{{physical-icon}}": (
    <TypeIcon type={"physical"} sx={{ verticalAlign: "middle" }} />
  ),
  "{{wind-icon}}": <TypeIcon type={"wind"} sx={{ verticalAlign: "middle" }} />,
  "{{bolt-icon}}": <TypeIcon type={"bolt"} sx={{ verticalAlign: "middle" }} />,
  "{{dark-icon}}": <TypeIcon type={"dark"} sx={{ verticalAlign: "middle" }} />,
  "{{earth-icon}}": (
    <TypeIcon type={"earth"} sx={{ verticalAlign: "middle" }} />
  ),
  "{{fire-icon}}": <TypeIcon type={"fire"} sx={{ verticalAlign: "middle" }} />,
  "{{ice-icon}}": <TypeIcon type={"ice"} sx={{ verticalAlign: "middle" }} />,
  "{{light-icon}}": (
    <TypeIcon type={"light"} sx={{ verticalAlign: "middle" }} />
  ),
  "{{poison-icon}}": (
    <TypeIcon type={"poison"} sx={{ verticalAlign: "middle" }} />
  ),
  "{{ranged-icon}}": <DistanceIcon sx={{ verticalAlign: "middle" }} />,
  "{{melee-icon}}": <MeleeIcon sx={{ verticalAlign: "middle" }} />,
  "{{offensive-spell-icon}}": (
    <OffensiveSpellIcon sx={{ verticalAlign: "middle" }} />
  ),
  "{{spell-icon}}": <SpellIcon sx={{ verticalAlign: "middle" }} />,
  "{{fainted-icon}}": <GiDeathSkull sx={{ verticalAlign: "middle" }} />,
  "{{value1}}": (value1) => <b>{value1}</b>,
  "{{value2}}": (value2) => <b>{value2}</b>,
  "{{value3}}": (value3) => <b>{value3}</b>,
};

function replaceTagsWithComponents(text, value1, value2, value3) {
  // Use a regular expression to replace tags with the corresponding component
  return t(text)
    .split(/(\{\{.*?\}\})/)
    .map((part) => {
      // If the part matches the value placeholders, replace with actual values
      if (part === "{{value1}}") {
        return <b>{value1}</b>; // Return value1 wrapped in <b> tags
      }
      if (part === "{{value2}}") {
        return <b>{value2}</b>; // Return value2 wrapped in <b> tags
      }
      if (part === "{{value3}}") {
        return <b>{t(value3)}</b>; // Return value3 wrapped in <b> tags
      }

      // Otherwise, check if it's a tag that maps to an icon or other component
      if (tagMap[part]) {
        return tagMap[part]; // Replace with the corresponding component if tag matches
      }

      // Return the part as it is if no match
      return part;
    });
}

export default function CombatLog({
  isMobile,
  logs = [],
  open: controlledOpen = false,
  onToggle = () => {},
  clearLogs,
}) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm")); // Detects small screens

  // Sort logs in descending order (newest first)
  const sortedLogs = [...logs].sort((a, b) => b.timestamp - a.timestamp);

  const [open, setOpen] = useState(controlledOpen);
  const [height, setHeight] = useState(isSmallScreen ? 150 : 200);
  const logContainerRef = useRef(null);
  const isResizing = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(height);

  const toggleLog = () => {
    const newOpen = !open;
    setOpen(newOpen);
    onToggle(newOpen); // Notify parent of the change
    setTimeout(() => {
      if (logContainerRef.current) {
        logContainerRef.current.scrollTop = 0; // Scroll to top (latest log first)
      }
    }, 100);
  };

  const handleMouseDown = (e) => {
    if (isSmallScreen) return; // Disable resizing on mobile
    isResizing.current = true;
    startY.current = e.clientY;
    startHeight.current = height;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!isResizing.current || isSmallScreen) return;

    const deltaY = e.clientY - startY.current;
    const newHeight = Math.max(
      100,
      Math.min(400, startHeight.current - deltaY)
    );
    setHeight(newHeight);
  };

  const handleMouseUp = () => {
    isResizing.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  useEffect(() => {
    if (controlledOpen !== open) {
      setOpen(controlledOpen); // Sync with parent prop
    }
    if (open && logContainerRef.current) {
      logContainerRef.current.scrollTop = 0; // Scroll to top when new logs are added
    }
  }, [controlledOpen, open, logs]); // Re-run the effect when logs, controlledOpen, or open changes

  return (
    <Box sx={{ mt: 2, width: "100%", mx: "auto" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Button
          variant="outlined"
          onClick={toggleLog}
          size={isMobile ? "small" : "medium"}
          fullWidth
        >
          {open ? "Hide Combat Log" : "Show Combat Log"}
        </Button>

        {/* Clear Logs Button (Only visible if expanded) */}
        {open && (
          <Button
            onClick={clearLogs}
            size="small"
            sx={{
              minWidth: "auto",
              padding: 0,
              marginLeft: 1,
              color: isDarkMode ? "#ddd" : "#555",
            }}
          >
            <DeleteSweepIcon />
          </Button>
        )}
      </Box>

      <Collapse in={open}>
        {/* Resize Handle (Hidden on Mobile) */}
        {!isSmallScreen && (
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "ns-resize",
              backgroundColor: isDarkMode ? "#555" : "#ccc",
              borderRadius: "8px 8px 0 0",
              py: 0.5,
              mt: 1,
              "&:hover": { backgroundColor: isDarkMode ? "#777" : "#aaa" },
            }}
            onMouseDown={handleMouseDown}
          >
            <DragHandleIcon
              fontSize="small"
              sx={{ color: isDarkMode ? "#ddd" : "#555", m: -1 }}
            />
          </Box>
        )}

        {/* Combat Log Panel */}
        <Paper
          elevation={3}
          sx={{
            p: 2,
            height: isSmallScreen ? 150 : height, // Fixed height on mobile
            overflowY: "auto",
            backgroundColor: isDarkMode ? "#333" : "#f9f9f9",
            borderRadius: "0 0 8px 8px",
            "&::-webkit-scrollbar": { width: 6 },
            "&::-webkit-scrollbar-thumb": {
              background: "#888",
              borderRadius: 3,
            },
          }}
          ref={logContainerRef}
        >
          {sortedLogs.map((log, index) => (
            <Box key={index} sx={{ mb: 1 }}>
              <Typography variant="caption" color="textSecondary">
                {isToday(log.timestamp)
                  ? format(log.timestamp, "HH:mm:ss")
                  : format(log.timestamp, "PP HH:mm:ss")}
              </Typography>
              <Typography variant="body2">
                {/* Replace tags in log.text with actual components */}
                {replaceTagsWithComponents(
                  log.text,
                  log.value1,
                  log.value2,
                  log.value3
                ).map((part, idx) =>
                  typeof part === "string" ? (
                    <span key={idx}>{part}</span>
                  ) : (
                    <span key={idx}>{part}</span>
                  )
                )}
              </Typography>
            </Box>
          ))}
          {sortedLogs.length === 0 && (
            <Typography variant="body2" color="textSecondary">
              No combat logs to show
            </Typography>
          )}
        </Paper>
      </Collapse>
    </Box>
  );
}
