import React, { useState, useCallback, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Grid,
  Typography,
  Box,
  IconButton,
  Paper,
  useTheme,
  useMediaQuery,
  Alert,
  Collapse,
  InputAdornment,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import PersonIcon from "@mui/icons-material/Person";
import DescriptionIcon from "@mui/icons-material/Description";
import { useTranslate } from "../../../../translation/translate";
import { ImageHandler } from "../../../../components/common/ImageHandler";
import MarkdownEditor from "../../../common/MarkdownEditor";
import { globalConfirm } from "../../../../utility/globalConfirm";

const SimpleNpcDialogEdit = ({ open, onClose, onSubmit, initialNpc }) => {
  const { t } = useTranslate();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  // Form state
  const [npc, setNpc] = useState({
    name: "",
    description: "",
    imgurl: "",
  });

  // Form validation state
  const [nameError, setNameError] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Reset form when dialog opens with new data
  useEffect(() => {
    if (open) {
      setNpc(
        initialNpc || {
          name: "",
          description: "",
          imgurl: "",
        }
      );
      setNameError(false);
      setIsDirty(false);
    }
  }, [open, initialNpc]);

  const handleChange = (field) => (eventOrValue) => {
    const newValue =
      typeof eventOrValue === "string"
        ? eventOrValue
        : eventOrValue.target.value;

    setNpc((prev) => ({ ...prev, [field]: newValue }));
    setIsDirty(true);

    // Validate name field
    if (field === "name") {
      setNameError(!newValue.trim());
    }
  };

  const handleImageUpdate = useCallback((newImageUrl) => {
    setNpc((prevNpc) => ({ ...prevNpc, imgurl: newImageUrl }));
    setIsDirty(true);
  }, []);

  const handleSubmit = () => {
    // Final validation before submit
    if (!npc.name.trim()) {
      setNameError(true);
      return;
    }

    onSubmit(npc);
    handleClose();
  };

  const handleClose = () => {
    setIsDirty(false);
    setNameError(false);
    setNpc( {
      name: "",
      description: "",
      imgurl: "",
    });
    onClose();
  };

  // Confirmation for unsaved changes
  const handleCloseWithConfirm = async () => {
    if (!isDirty) {
      handleClose();
      return;
    }

    const confirmation = await globalConfirm(t("Discard unsaved changes?"));

    if (confirmation) {
      handleClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleCloseWithConfirm}
      fullWidth
      maxWidth="md"
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : 2,
          height: fullScreen ? "100%" : "auto",
          maxHeight: fullScreen ? "100%" : "90vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${theme.palette.divider}`,
          p: 2,
          mb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <PersonIcon sx={{ mr: 1.5, color: theme.palette.primary.main }} />
          <Typography variant="h3" component="span">
            {initialNpc ? t("Edit NPC") : t("Create Simple NPC")}
          </Typography>
        </Box>
        <IconButton onClick={handleCloseWithConfirm} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2, sm: 3 }, pb: 1 }}>
        <Collapse in={nameError}>
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => setNameError(false)}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
          >
            {t("NPC name is required")}
          </Alert>
        </Collapse>

        <Grid container spacing={3}>
          {/* Name Section */}
          <Grid item xs={12}>
            <Paper
              elevation={0}
              variant="outlined"
              sx={{ p: 2, borderRadius: 1 }}
            >
              <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
                <PersonIcon
                  sx={{ mr: 1, color: theme.palette.text.secondary }}
                />
                <Typography variant="subtitle1" fontWeight="medium">
                  {t("Basic Information")}
                </Typography>
              </Box>

              <TextField
                fullWidth
                label={t("Name")}
                value={npc.name}
                onChange={handleChange("name")}
                error={nameError}
                helperText={nameError ? t("Name is required") : " "}
                variant="outlined"
                autoFocus
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Paper>
          </Grid>

          {/* Image Section */}
          <Grid item xs={12}>
            <ImageHandler
              imageUrl={npc.imgurl}
              onImageUpdate={handleImageUpdate}
              entityType="npc"
            />
          </Grid>

          {/* Description Section */}
          <Grid item xs={12}>
            <Paper
              elevation={0}
              variant="outlined"
              sx={{ p: 2, borderRadius: 1 }}
            >
              <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
                <DescriptionIcon
                  sx={{ mr: 1, color: theme.palette.text.secondary }}
                />
                <Typography variant="subtitle1" fontWeight="medium">
                  {t("Description")}
                </Typography>
              </Box>

              <MarkdownEditor
                initialValue={npc.description}
                onChange={handleChange("description")}
              />
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ display: "block", mt: 1 }}
              >
                {t("Use markdown to format the NPC description")}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
          justifyContent: "space-between",
        }}
      >
        <Button
          onClick={handleCloseWithConfirm}
          variant="outlined"
          startIcon={<CloseIcon />}
        >
          {t("Cancel")}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={!npc.name || !isDirty}
          startIcon={<SaveIcon />}
        >
          {initialNpc ? t("Update NPC") : t("Create NPC")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SimpleNpcDialogEdit;
