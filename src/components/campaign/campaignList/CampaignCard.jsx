import React from "react";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";
import fultimator_logo from "./fultimator_logo.webp";

// Use the local image file directly
const DEFAULT_CAMPAIGN_IMAGE = fultimator_logo;

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return "Never played";

  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    return `${Math.floor(diffDays / 7)} weeks ago`;
  } else {
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
};

const CampaignCard = ({ campaign, onMenuOpen, onClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const hasPlayed = Boolean(campaign.lastPlayedAt);

  // Safely handle campaign data
  const {
    id,
    name = "Untitled Campaign",
    description = "No description available",
    imageUrl = null,
    lastPlayedAt,
    tags = [],
  } = campaign || {};

  // Stop event propagation when clicking the menu button
  const handleMenuClick = (e, campaign) => {
    e.stopPropagation();
    onMenuOpen(e, campaign);
  };

  // Fixed card dimensions
  const cardWidth = "100%";
  const cardHeight = 360; // Fixed height for all cards
  const imageHeight = 160; // Fixed image height
  const contentHeight = cardHeight - imageHeight;

  return (
    <Card
      elevation={3}
      sx={{
        width: cardWidth,
        height: cardHeight,
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: 6,
        },
        overflow: "visible",
        position: "relative",
      }}
    >
      <Box
        onClick={() => onClick(id)}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          cursor: "pointer",
        }}
      >
        <Box sx={{ position: "relative", height: imageHeight }}>
          <CardMedia
            component="img"
            height={imageHeight}
            image={imageUrl || DEFAULT_CAMPAIGN_IMAGE}
            alt={name}
            sx={{
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              objectFit: "cover",
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = DEFAULT_CAMPAIGN_IMAGE;
            }}
          />
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0) 70%, rgba(0,0,0,0.6) 100%)",
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
            }}
          />

          <IconButton
            size="medium"
            onClick={(e) => handleMenuClick(e, campaign)}
            aria-label="campaign options"
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              backgroundColor: "transparent", // fix
              color: "white",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.2)", // subtle white highlight on hover
                transform: "scale(1.1)",
              },
              transition: "all 0.2s ease",
              zIndex: 2,
            }}
          >
            <MoreVertIcon />
          </IconButton>

          {hasPlayed && (
            <Tooltip title="Last played" placement="top" arrow>
              <Chip
                size="small"
                icon={<CalendarIcon fontSize="small" />}
                label={formatDate(lastPlayedAt)}
                sx={{
                  position: "absolute",
                  bottom: -12,
                  left: 16,
                  backgroundColor: theme.palette.primary.main,
                  color: "#fff", // ensure white text
                  fontWeight: "medium",
                  border: `2px solid ${theme.palette.background.paper}`,
                  "& .MuiChip-icon": {
                    color: "#fff", // force white icon color
                  },
                  "& .MuiChip-label": {
                    color: "#fff", // force white label text
                  },
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  zIndex: 1,
                }}
              />
            </Tooltip>
          )}
        </Box>

        <CardContent
          sx={{
            height: contentHeight,
            pt: hasPlayed ? 2 : 1,
            px: 3,
            pb: 2,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: 700,
              fontSize: { xs: "1.1rem", sm: "1.3rem" },
              lineHeight: 1.3,
              mt: hasPlayed ? 1 : 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              color: theme.palette.text.primary,
            }}
          >
            {name}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              height: "3.6em",
              fontSize: "0.875rem",
            }}
          >
            {description}
          </Typography>

          <Box
            sx={{
              mt: "auto",
              display: "flex",
              flexWrap: "wrap",
              gap: 0.75,
              pt: 1,
              overflow: "hidden",
              maxHeight: "32px", // Ensure consistent space for tags
            }}
          >
            {tags && tags.length > 0 ? (
              <>
                {tags.slice(0, isMobile ? 2 : 3).map(
                  (tag, index) =>
                    typeof tag === "string" && (
                      <Chip
                        key={index}
                        label={tag}
                        size="small"
                        variant="outlined"
                        sx={{
                          borderRadius: 1,
                          fontSize: "0.75rem",
                          backgroundColor: `${theme.palette.background.default}`,
                          borderColor: theme.palette.primary.light,
                          transition: "all 0.2s ease",
                        }}
                      />
                    )
                )}
                {tags.length > (isMobile ? 2 : 3) && (
                  <Chip
                    label={`+${tags.length - (isMobile ? 2 : 3)}`}
                    size="small"
                    sx={{
                      borderRadius: 1,
                      backgroundColor: theme.palette.primary.light,
                      color: theme.palette.primary.contrastText,
                    }}
                  />
                )}
              </>
            ) : (
              <Box sx={{ height: "24px" }} /> // Empty space to maintain consistent height
            )}
          </Box>
        </CardContent>
      </Box>
    </Card>
  );
};

export default CampaignCard;
