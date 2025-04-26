import React from "react";
import {
  Box,
  Fade,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
  Button,
} from "@mui/material";
import {
  useTranslate,
  replacePlaceholders,
} from "../../../translation/translate";

/**
 * Toolbar component for bulk operations on selected items
 *
 * @param {Object} props
 * @param {Array} props.selectedItems - Array of selected item IDs
 * @param {boolean} props.selectionMode - Whether selection mode is active
 * @param {Function} props.onClearSelection - Function to clear current selection
 * @param {Function} props.onMoveToFolder - Function to open move to folder dialog
 * @param {Function} props.onUnlink - Function to unlink selected items
 * @param {Object} props.customIcons - Custom icons for different actions
 * @param {React.ReactNode} props.customIcons.move - Icon for move action
 * @param {React.ReactNode} props.customIcons.unlink - Icon for unlink action
 * @param {React.ReactNode} props.customIcons.clear - Icon for clear selection action
 * @param {Object} props.itemLabels - Labels for items in singular and plural forms
 * @param {string} props.itemLabels.singular - Singular form of item label
 * @param {string} props.itemLabels.plural - Plural form of item label
 * @param {string} props.itemLabels.translationKey - Base translation key for item labels
 */
const ContentToolbar = ({
  selectedItems = [],
  selectionMode = false,
  onClearSelection,
  onMoveToFolder,
  onUnlink,
  customIcons,
  itemLabels = {
    singular: "item",
    plural: "items",
    translationKey: "explorer_item_generic",
  },
}) => {
  // Initialize the translation hook
  const { t } = useTranslate();

  // Get properly formatted item count text with translation
  const getSelectionText = () => {
    const isSingular = selectedItems.length === 1;
    const labelKey = isSingular
      ? `${itemLabels.translationKey}_singular`
      : `${itemLabels.translationKey}_plural`;
    const phraseKey = isSingular
      ? `${itemLabels.translationKey}_selected_singular`
      : `${itemLabels.translationKey}_selected_plural`;
  
    return replacePlaceholders(t(phraseKey), {
      count: selectedItems.length,
      itemLabel: t(labelKey),
    });
  };
  
  return (
    <Fade in={selectionMode}>
      <Toolbar
        variant="dense"
        sx={{
          bgcolor: "primary.main",
          color: "primary.contrastText",
          borderRadius: 2,
          mb: 2,
          display: selectionMode ? "flex" : "none",
          justifyContent: "space-between",
          flexWrap: "wrap",
          p: { xs: 1, sm: 1.5 },
          gap: 1,
        }}
      >
        {/* Selected Count */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="subtitle1">{getSelectionText()}</Typography>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          <Button
            size="small"
            startIcon={customIcons.move}
            variant="outlined"
            color="inherit"
            onClick={onMoveToFolder}
            aria-label={t("explorer_move_to_folder")}
          >
            {t("explorer_move_to_folder")}
          </Button>
          <Button
            size="small"
            startIcon={customIcons.unlink}
            variant="outlined"
            color="inherit"
            onClick={onUnlink}
            aria-label={t("explorer_unlink_selected")}
          >
            {t("explorer_unlink_selected")}
          </Button>
          <Tooltip title={t("explorer_clear_selection")}>
            <IconButton
              size="small"
              onClick={onClearSelection}
              color="inherit"
              aria-label={t("explorer_clear_selection")}
            >
              {customIcons.clear}
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </Fade>
  );
};

export default ContentToolbar;
