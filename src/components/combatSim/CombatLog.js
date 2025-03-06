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

export default function CombatLog({
  isMobile,
  logs = [],
  open: controlledOpen = false,
  onToggle = () => {},
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
    const newHeight = Math.max(100, Math.min(400, startHeight.current - deltaY));
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
      <Button
        variant="outlined"
        fullWidth
        onClick={toggleLog}
        size={isMobile ? "small" : "medium"}
      >
        {open ? "Hide Combat Log" : "Show Combat Log"}
      </Button>

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
            <DragHandleIcon fontSize="small" sx={{ color: isDarkMode ? "#ddd" : "#555", m: -1 }} />
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
              <Typography variant="body2">{log.text}</Typography>
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
