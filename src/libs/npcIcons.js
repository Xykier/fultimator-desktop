import {
  GiRaiseZombie,
  GiWolfHead,
  GiRobotGolem,
  GiEvilBat,
  GiFire,
  GiSwordwoman,
  GiGooeyDaemon,
  GiRose,
} from "react-icons/gi";
import SearchIcon from "@mui/icons-material/Search";
import ShieldIcon from "@mui/icons-material/Shield";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import GroupIcon from "@mui/icons-material/Group";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";

const speciesIconMap = {
  Beast: GiWolfHead,
  Construct: GiRobotGolem,
  Demon: GiEvilBat,
  Elemental: GiFire,
  Humanoid: GiSwordwoman,
  Undead: GiRaiseZombie,
  Plant: GiRose,
  Monster: GiGooeyDaemon,
};

export function getSpeciesIcon(species) {
  return speciesIconMap[species] || SearchIcon;
}

export function getRankIcon(rank, color) {
  // Map rank names to icons and colors
  const rankIconMap = {
    soldier: { icon: ShieldIcon, color: color || "#6c757d" },
    elite: { icon: MilitaryTechIcon, color: color || "#0d6efd" },
    champion1: { icon: EmojiEventsIcon, color: color || "#ffc107" },
    champion2: { icon: EmojiEventsIcon, color: color || "#ffc107" },
    champion3: { icon: EmojiEventsIcon, color: color || "#ffc107" },
    champion4: { icon: EmojiEventsIcon, color: color || "#ffc107" },
    champion5: { icon: EmojiEventsIcon, color: color || "#ffc107" },
    champion6: { icon: EmojiEventsIcon, color: color || "#ffc107" },
    companion: { icon: GroupIcon, color: color || "#20c997" },
    groupvehicle: { icon: DirectionsCarIcon, color: color || "#6610f2" },
  };

  return rankIconMap[rank] || { icon: ShieldIcon, color: color || "#6c757d" };
}
