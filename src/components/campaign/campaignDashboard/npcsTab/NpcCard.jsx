import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  Box,
  Checkbox,
  Fade,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import NpcCardHeader from "./NpcCardHeader";
import NpcCardContent from "./NpcCardContent";
import NpcCardActions from "./NpcCardActions";
import NpcDetailDialog from "./NpcDetailDialog";
import { useNpcActions } from "./hooks/useNpcActions";
import { useNpcStore } from "./stores/npcDataStore";

const StyledCard = styled(Card)(({ theme, selected }) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  height: "100%",
  minHeight: 200,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "relative",
  border: selected ? `2px solid ${theme.palette.primary.main}` : "none",
  borderRadius: theme.spacing(1.5),
  overflow: "hidden",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[8],
  },
}));

const SelectionCheckbox = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: 8,
  left: 8,
  zIndex: 2,
  backgroundColor: "rgba(255, 255, 255, 0.85)",
  borderRadius: "50%",
  padding: 0,
  boxShadow: theme.shadows[2],
}));

const CardOverlay = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor:
    theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, 0.05)"
      : "rgba(0, 0, 0, 0.03)",
  zIndex: 1,
  pointerEvents: "none",
}));

const NpcCard = ({
  item,
  onUnlink,
  onNotes,
  onMove,
  onSelect,
  isSelected = false,
  selectionMode = false,
}) => {
  const { campaignId, loadNpcs, showSnackbar } = useNpcStore();
  const { handleEditNpc, handleSetAttitude } = useNpcActions(
    campaignId,
    loadNpcs,
    showSnackbar
  );
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isSimple = item.isSimplified;
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Long press handling
  const longPressTimeoutRef = useRef(null);
  const touchStartPositionRef = useRef({ x: 0, y: 0 });
  const touchMoved = useRef(false);
  const LONG_PRESS_DURATION = 600; // 600ms long press duration

  const handleDetailsOpen = (e) => {
    if (isSimple) return;
    e.stopPropagation();
    setDetailsDialogOpen(true);
  };

  const handleDetailsClose = () => {
    setDetailsDialogOpen(false);
  };

  const handleCheckboxChange = (e) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(item.id, !isSelected);
    }
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
      }
    };
  }, []);

  const handleTouchStart = (e) => {
    // Store the initial touch position
    touchStartPositionRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
    touchMoved.current = false;

    // Start the long press timer
    if (isMobile && onSelect) {
      longPressTimeoutRef.current = setTimeout(() => {
        // Only trigger if the touch hasn't moved significantly
        if (!touchMoved.current && onSelect) {
          onSelect(item.id, !isSelected);
          // Provide haptic feedback if available
          if (navigator.vibrate) {
            navigator.vibrate(50);
          }
        }
      }, LONG_PRESS_DURATION);
    }
  };

  const handleTouchMove = (e) => {
    // Check if touch has moved more than a threshold
    const moveThreshold = 10;
    const dx = e.touches[0].clientX - touchStartPositionRef.current.x;
    const dy = e.touches[0].clientY - touchStartPositionRef.current.y;

    if (Math.abs(dx) > moveThreshold || Math.abs(dy) > moveThreshold) {
      touchMoved.current = true;
      // Cancel the long press timeout
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
      }
    }
  };

  const handleTouchEnd = () => {
    // Clear the timeout to prevent it from firing after touch end
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
    }
  };

  const handleCardClick = (e) => {
    if (isMobile) {
      if (selectionMode && onSelect) {
        // In selection mode, a single tap toggles selection
        onSelect(item.id, !isSelected);
      } else {
        // Not in selection mode, open details
        handleDetailsOpen(e);
      }
    } else {
      // Desktop behavior
      if (selectionMode && onSelect) {
        onSelect(item.id, !isSelected);
      }
    }
  };

  // In desktop mode, double click opens details if not in selection mode, else does nothing
  const handleCardDoubleClick = (e) => {
    if (!isMobile) {
      if (!selectionMode) {
        handleDetailsOpen(e);
      }
    }
  };

  return (
    <React.Fragment>
      <StyledCard
        elevation={isHovered || isSelected ? 4 : 2}
        onClick={handleCardClick}
        onDoubleClick={handleCardDoubleClick}
        selected={isSelected}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Selection checkbox */}
        <Fade in={selectionMode || isHovered || isSelected}>
          <SelectionCheckbox>
            <Checkbox
              checked={isSelected}
              onChange={handleCheckboxChange}
              onClick={(e) => e.stopPropagation()}
              color="primary"
              size="small"
            />
          </SelectionCheckbox>
        </Fade>

        {/* Selected overlay */}
        {isSelected && <CardOverlay />}

        {/* Card Header with Image */}
        <NpcCardHeader imageUrl={item.imgurl} />

        {/* Card Content with NPC Details */}
        <NpcCardContent
          name={item.name}
          level={item.lvl}
          species={item.species}
          rank={item.rank}
          villain={item.villain}
          isSimple={isSimple}
        />

        {/* Card Actions */}
        <NpcCardActions
          npcId={item.id}
          attitude={item.attitude || "neutral"}
          onEdit={() => handleEditNpc(item)}
          onUnlink={() => onUnlink && onUnlink(item.id)}
          onNotes={() => onNotes && onNotes(item.id)}
          onDetails={handleDetailsOpen}
          onMove={() => onMove && onMove(item.id)}
          onSetAttitude={(newAttitude) =>
            handleSetAttitude(item.id, newAttitude)
          }
          isSimple={isSimple}
        />
      </StyledCard>

      {/* NPC Details Dialog */}
      <NpcDetailDialog
        open={detailsDialogOpen}
        onClose={handleDetailsClose}
        npc={item}
      />
    </React.Fragment>
  );
};

export default NpcCard;
