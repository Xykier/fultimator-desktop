// NpcCardContent.jsx
import React from "react";
import { Box, Typography, Tooltip, Chip } from "@mui/material";
import { styled } from "@mui/material/styles";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import { getSpeciesIcon, getRankIcon } from "../../../../libs/npcIcons";
import getContrastColor from "../../../../utility/getContrastColor";

// Standardized icon size constant
const ICON_SIZE = 16;

const ContentContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5, 1),
  textAlign: "center",
  flexGrow: 1,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  gap: theme.spacing(0.5),
}));

const NpcName = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  width: "100%",
  color: theme.palette.text.primary,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  padding: theme.spacing(0, 0.5),
}));

const BadgesContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexWrap: "wrap",
  gap: theme.spacing(0.5),
  marginTop: theme.spacing(0.5),
  padding: theme.spacing(0, 0.5),
}));

const LevelChip = styled(Chip)(({ theme }) => ({
  height: 22,
  fontSize: 12,
  fontWeight: 600,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  "& .MuiChip-label": {
    padding: theme.spacing(0, 1),
  },
}));

const IconBadge = styled(Box)(({ bgcolor, iconcolor }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: bgcolor || "#e0e0e0", // Default gray if no bgcolor provided
  borderRadius: "50%",
  width: 24,
  height: 24,
  "& svg": {
    fontSize: ICON_SIZE,
    color: iconcolor || "#424242", // Default dark gray if no iconcolor provided
  },
}));

const getRankName = (rank) => {
  if (rank && rank.startsWith("champion")) {
    const level = rank.charAt(rank.length - 1);
    return `Champion ${level}`;
  }
  return rank ? rank.charAt(0).toUpperCase() + rank.slice(1) : "";
};

const NpcCardContent = ({ name, level, species, rank, villain, isSimple }) => {
  const SpeciesIcon = getSpeciesIcon(species);

  // Get rank icon and color
  const rankInfo = getRankIcon(rank || "soldier");
  const RankIcon = rankInfo.icon;
  const rankColor = rankInfo.color || "#e0e0e0"; // Default if no color returned
  const rankName = getRankName(rank || "soldier");

  // Use the getContrastColor utility to determine appropriate text color
  const rankIconColor = getContrastColor(rankColor);

  return (
    <ContentContainer>
      <NpcName variant="body2">{name}</NpcName>

      {!isSimple && (
        <BadgesContainer>
          {/* Level Badge */}
          <Tooltip title={`Level ${level}`} arrow>
            <LevelChip label={level} size="small" />
          </Tooltip>

          {/* Rank Badge */}
          <Tooltip title={rankName} arrow>
            <IconBadge bgcolor={rankColor} iconcolor={rankIconColor}>
              <RankIcon />
            </IconBadge>
          </Tooltip>

          {/* Species Icon */}
          {SpeciesIcon && (
            <Tooltip title={species} arrow>
              <IconBadge>
                <SpeciesIcon />
              </IconBadge>
            </Tooltip>
          )}

          {/* Villain Badge */}
          {villain && (
            <Tooltip title={`Villain: ${villain}`} arrow>
              <IconBadge bgcolor="#f44336" iconcolor="#ffffff">
                <ReportProblemIcon />
              </IconBadge>
            </Tooltip>
          )}
        </BadgesContainer>
      )}
    </ContentContainer>
  );
};

export default NpcCardContent;
