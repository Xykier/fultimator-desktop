import React, { useRef, useState } from "react";
import { Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import { languageOptions, useTranslate } from "../../translation/translate";
import { globalConfirm } from "../../utility/globalConfirm";

const LanguageMenu = () => {
  const { t } = useTranslate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const selectedLanguage =
    useRef(localStorage.getItem("selectedLanguage")).current ?? "en";


  const handleLanguageChange = async (languageCode : string) => {
    // Save the selected language
    await localStorage.setItem("selectedLanguage", languageCode);
  
    // Check if the current URL includes "npc-gallery"
    if (window.location.href.includes("npc-gallery")) {
      // Confirm with the user about unsaved progress
      const userConfirmed = await globalConfirm(
        "Switching language will clear out all your unsaved progress, would you like to continue?"
      );
  
      if (userConfirmed) {
        window.location.reload(); // Reload the page if confirmed
      }
    } else {
      window.location.reload(); // Simply reload if not in "npc-gallery"
    }
  };

  return (
    <>
      <MenuItem
        onClick={handleClick}
        aria-label={`${t("Change Language to:", true)} ${getLanguageName(
          selectedLanguage
        )}`}
      >
        <ListItemIcon>
          <LanguageIcon />
        </ListItemIcon>
        <ListItemText
          primary={`${t("Language:", true)} ${getLanguageName(
            selectedLanguage
          )}`}
        />
      </MenuItem>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        {languageOptions.map((option : { code : string, label : string} ) => (
          <MenuItem
            key={option.code}
            onClick={() => handleLanguageChange(option.code)}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

const getLanguageName = (languageCode: string): string => {
  switch (languageCode) {
    case "en":
      return "English";
    case "it":
      return "Italiano (Italian)";
    case "es":
      return "Español (Spanish)";
    case "de":
      return "Deutsch (German)";
    case "pl":
      return "Polski (Polish)";
    case "fr":
      return "Française (French)";
    case "pt-BR":
      return "Português (Brasil)";
    default:
      return languageCode;
  }
};

export default LanguageMenu;
