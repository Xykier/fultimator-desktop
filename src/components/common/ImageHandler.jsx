import React, { useState, useEffect, useCallback } from "react";
import {
  Grid,
  TextField,
  Button,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Box,
  Paper,
  Alert,
  Snackbar,
  InputAdornment,
  IconButton,
  Tooltip,
  Fade,
  CircularProgress,
} from "@mui/material";
import {
  FileUpload,
  Link as LinkIcon,
  CheckCircle,
  Error as ErrorIcon,
  Delete,
  Refresh,
  Help,
} from "@mui/icons-material";
import { useTranslate, replacePlaceholders } from "../../translation/translate";

export function ImageHandler({
  imageUrl,
  onImageUpdate,
  title = "Image",
  entityType = "entity",
  helperText = null,
  fileUploadId = "file-upload",
  isEditMode = true,
  additionalInfo = null,
}) {
  const { t } = useTranslate();

  // The current image
  const [storedImage, setStoredImage] = useState({
    url: imageUrl || "",
    isDataUrl: imageUrl?.startsWith("data:image") || false,
  });

  // Store URL and uploaded image separately
  const [urlImage, setUrlImage] = useState(
    imageUrl && !imageUrl.startsWith("data:image") ? imageUrl : ""
  );
  const [uploadedImage, setUploadedImage] = useState(
    imageUrl && imageUrl.startsWith("data:image") ? imageUrl : ""
  );

  // UI state
  const [imageMode, setImageMode] = useState(
    imageUrl?.startsWith("data:image") ? "upload" : "url"
  );
  const [isImageError, setIsImageError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [previewStatus, setPreviewStatus] = useState(
    imageUrl ? "success" : "initial"
  );
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Reset states when imageUrl changes
  useEffect(() => {
    const newImageUrl = imageUrl || "";
    const isDataUrl = newImageUrl.startsWith("data:image");

    setStoredImage({
      url: newImageUrl,
      isDataUrl,
    });

    if (isDataUrl) {
      setUploadedImage(newImageUrl);
      setImageMode("upload");
    } else if (newImageUrl) {
      setUrlImage(newImageUrl);
      setImageMode("url");
    }

    setPreviewStatus(newImageUrl ? "success" : "initial");
    setIsImageError(false);
    setErrorMessage("");
  }, [imageUrl]);

  // Get the currently active image based on mode
  const getCurrentImage = () => {
    return imageMode === "url" ? urlImage : uploadedImage;
  };

  const handleImageModeChange = (event, newMode) => {
    if (newMode === null) return;

    // Reset error states when switching modes
    setIsImageError(false);
    setErrorMessage("");

    // Update the preview status based on whether there's an image in the new mode
    const newModeImage = newMode === "url" ? urlImage : uploadedImage;
    setPreviewStatus(newModeImage ? "success" : "initial");

    setImageMode(newMode);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setPreviewStatus("loading");

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setIsImageError(true);
      setErrorMessage(t("Only image files are allowed"));
      setPreviewStatus("error");
      setIsLoading(false);
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setIsImageError(true);
      setErrorMessage(t("File size exceeds 5MB limit"));
      setPreviewStatus("error");
      setIsLoading(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setUploadedImage(dataUrl);
      setIsImageError(false);
      setErrorMessage("");
      setPreviewStatus("success");
      setIsLoading(false);
    };
    reader.onerror = () => {
      setIsImageError(true);
      setErrorMessage(t("Failed to read file"));
      setPreviewStatus("error");
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const validateUrlImage = useCallback(
    async (url) => {
      if (!url) return false;

      setIsLoading(true);
      setPreviewStatus("loading");

      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          setPreviewStatus("success");
          setIsLoading(false);
          resolve(true);
        };
        img.onerror = () => {
          setIsImageError(true);
          setErrorMessage(t("Failed to load image from URL"));
          setPreviewStatus("error");
          setIsLoading(false);
          resolve(false);
        };
        img.src = url;
      });
    },
    [t]
  );

  const checkImageSize = useCallback(
    async (imageUrl) => {
      if (!imageUrl) return false;

      // Handle Base64 data URLs
      if (imageUrl.startsWith("data:image")) {
        const size = Math.floor(imageUrl.length * 0.75); // Approximate byte size
        if (size > 5 * 1024 * 1024) {
          setIsImageError(true);
          setErrorMessage(t("Error: Image size is too large, max 5MB"));
          return false;
        }
        return true;
      }

      try {
        setIsLoading(true);
        const response = await fetch(imageUrl, { method: "HEAD" });
        setIsLoading(false);

        if (!response.ok) {
          setIsImageError(true);
          setErrorMessage(
            t("Failed to fetch image: ") +
              response.status +
              " " +
              response.statusText
          );
          return false;
        }

        // If Content-Length header is available, check size
        const contentLength = response.headers.get("Content-Length");
        if (contentLength && parseInt(contentLength, 10) > 5 * 1024 * 1024) {
          setIsImageError(true);
          setErrorMessage(t("Error: Image size is too large, max 5MB"));
          return false;
        }

        setIsImageError(false);
        setErrorMessage("");
        return true;
      } catch (error) {
        console.error("Error: ", error);
        setIsImageError(true);
        setErrorMessage(t("Error: ") + error.message);
        setIsLoading(false);
        return false;
      }
    },
    [t]
  );

  const handleUpdateImage = async () => {
    const currentImage = getCurrentImage();

    // If empty URL, treat as remove
    if (!currentImage) {
      handleRemoveImage();
      return;
    }

    let isValid = false;

    // Validate image
    if (imageMode === "url") {
      isValid = await validateUrlImage(currentImage);
      if (isValid) {
        isValid = await checkImageSize(currentImage);
      }
    } else {
      // Already validated during upload
      isValid = !isImageError && currentImage !== "";
    }

    if (isValid) {
      onImageUpdate(currentImage);

      setStoredImage({
        url: currentImage,
        isDataUrl: currentImage.startsWith("data:image"),
      });

      setSuccessMessage(
        imageMode === "url" ? t("success_url_updated") : t("success_uploaded")
      );
      setShowSuccessMessage(true);
    }
  };

  const handleRemoveImage = () => {
    // Clear all image states
    if (imageMode === "url") {
      setUrlImage("");
    } else {
      setUploadedImage("");
    }

    setPreviewStatus("initial");
    setIsImageError(false);
    setErrorMessage("");

    // Only update if there is currently an image
    if (imageUrl) {
      onImageUpdate("");

      setStoredImage({
        url: "",
        isDataUrl: false,
      });

      setSuccessMessage(t("success_removed"));
      setShowSuccessMessage(true);
    }
  };

  const handleUrlChange = (e) => {
    const newUrl = e.target.value;
    setUrlImage(newUrl);
    setIsImageError(false);
    setErrorMessage("");

    // Reset preview status if URL is cleared
    if (!newUrl) {
      setPreviewStatus("initial");
    }
  };

  // Get the image to display in the preview
  const getPreviewImage = () => {
    // When loading, show the current image that's being validated
    if (previewStatus === "loading") {
      return getCurrentImage();
    }

    // Otherwise show the current image for the active mode
    return getCurrentImage();
  };

  // Don't render if not in edit mode
  if (!isEditMode) return null;

  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        mt: 2,
        mb: 2,
        borderRadius: "8px",
        bgcolor: "background.paper",
      }}
    >
      <Typography variant="h4" component="h3" sx={{ mb: 2 }}>
        {t(title)}
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <ToggleButtonGroup
              value={imageMode}
              exclusive
              onChange={handleImageModeChange}
              aria-label="image source"
              size="small"
              sx={{ mr: 1 }}
            >
              <ToggleButton value="url" aria-label="url">
                <LinkIcon sx={{ mr: 1 }} />
                {t("image_url_mode")}
                {storedImage.url && !storedImage.isDataUrl && (
                  <Box
                    component="span"
                    sx={{
                      ml: 1,
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: "success.main",
                      display: "inline-block",
                    }}
                  />
                )}
              </ToggleButton>
              <ToggleButton value="upload" aria-label="upload">
                <FileUpload sx={{ mr: 1 }} />
                {t("image_upload_mode")}
                {storedImage.url && storedImage.isDataUrl && (
                  <Box
                    component="span"
                    sx={{
                      ml: 1,
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: "success.main",
                      display: "inline-block",
                    }}
                  />
                )}
              </ToggleButton>
            </ToggleButtonGroup>

            <Tooltip
              title={
                <div>
                  <Typography variant="body2">
                    {imageMode === "url"
                      ? replacePlaceholders(t("tooltip_url_mode"), { entity: t(entityType) })
                      : replacePlaceholders(t("note_uploaded_images"), { entity: t(entityType) })}
                  </Typography>
                </div>
              }
            >
              <IconButton size="small">
                <Help fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Grid>

        <Grid item xs={12} md={8}>
          {imageMode === "url" ? (
            <TextField
              id="imgurl"
              label={t("image_url_label")}
              value={urlImage}
              onChange={handleUrlChange}
              fullWidth
              error={isImageError}
              helperText={isImageError ? errorMessage : helperText}
              variant="outlined"
              placeholder="https://example.com/image.png"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LinkIcon />
                  </InputAdornment>
                ),
                endAdornment: urlImage && (
                  <InputAdornment position="end">
                    <Tooltip title={t("preview_image_tooltip")}>
                      <IconButton
                        edge="end"
                        onClick={() => validateUrlImage(urlImage)}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <CircularProgress size={20} />
                        ) : (
                          <Refresh />
                        )}
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
            />
          ) : (
            <Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id={fileUploadId}
                  type="file"
                  onChange={handleFileUpload}
                />
                <label htmlFor={fileUploadId}>
                  <Button
                    variant="outlined"
                    component="span"
                    fullWidth
                    startIcon={<FileUpload />}
                    sx={{ height: "56px" }}
                  >
                    {uploadedImage
                      ? t("button_change_image")
                      : t("button_choose_image")}
                  </Button>
                </label>

                {uploadedImage && !isImageError && (
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <CheckCircle
                      color="success"
                      sx={{ mr: 1 }}
                      fontSize="small"
                    />
                    <Typography variant="body2" color="textSecondary">
                      {t("image_upload_success")}
                    </Typography>
                  </Box>
                )}
              </Box>

              {isImageError && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {errorMessage}
                </Alert>
              )}

              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ mt: 1, display: "block" }}
              >
                {replacePlaceholders(t("note_uploaded_images"), { entity: t(entityType) })}
              </Typography>
            </Box>
          )}

          <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              onClick={handleUpdateImage}
              disabled={!getCurrentImage() || isImageError || isLoading}
              startIcon={<CheckCircle />}
              sx={{ flexGrow: 1 }}
            >
              {imageMode === "url"
                ? t("button_set_url_image")
                : t("button_use_uploaded_image")}
            </Button>
            <Button
              variant="outlined"
              onClick={handleRemoveImage}
              startIcon={<Delete />}
              color="error"
              disabled={!getCurrentImage()}
            >
              {t("Remove")}
            </Button>
          </Box>

          {/* Status information */}
          {storedImage.url && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                {replacePlaceholders(t("current_image_label"), { entity: t(entityType) })}:{" "}
                {storedImage.isDataUrl
                  ? t("local_image_type")
                  : t("url_image_type")}
              </Typography>
              {imageMode === "url" && storedImage.isDataUrl && (
                <Typography variant="caption" color="textSecondary">
                  {t("switch_to_upload_mode")}
                </Typography>
              )}
              {imageMode === "upload" && !storedImage.isDataUrl && (
                <Typography variant="caption" color="textSecondary">
                  {t("switch_to_url_mode")}
                </Typography>
              )}
            </Alert>
          )}

          {additionalInfo}
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {t("preview_title")}
          </Typography>
          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              p: 1,
              height: "200px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              bgcolor: "background.default",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {previewStatus === "loading" && <CircularProgress size={40} />}

            {previewStatus === "error" && (
              <Box sx={{ textAlign: "center" }}>
                <ErrorIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="body2" color="error">
                  {errorMessage || t("error_load_failed")}
                </Typography>
              </Box>
            )}

            {previewStatus === "initial" && !getCurrentImage() && (
              <Typography variant="body2" color="textSecondary">
                {t("preview_no_image")}
              </Typography>
            )}

            {getPreviewImage() && previewStatus !== "error" && (
              <Fade in={previewStatus === "success"}>
                <img
                  src={getPreviewImage()}
                  alt={replacePlaceholders(t("preview_alt_text"), { entity: t(entityType) })}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                  }}
                  onError={() => {
                    setPreviewStatus("error");
                    setIsImageError(true);
                    setErrorMessage(t("error_load_failed"));
                  }}
                  onLoad={() => setPreviewStatus("success")}
                />
              </Fade>
            )}
          </Box>
        </Grid>
      </Grid>

      <Snackbar
        open={showSuccessMessage}
        autoHideDuration={3000}
        onClose={() => setShowSuccessMessage(false)}
        message={successMessage}
      />
    </Paper>
  );
}
