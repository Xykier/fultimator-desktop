import React from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Dialog,
  Box
} from "@mui/material";
import { Close, Save } from "@mui/icons-material";
import MarkdownEditor from "../../common/MarkdownEditor";

export default function MarkdownEditDialog({
  open,
  onClose,
  onSave,
  onChange,
  initialValue,
  title,
  t
}) {
  return (
    <Dialog fullScreen open={open} onClose={onClose}>
      <AppBar sx={{ position: "relative" }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={onClose}
            aria-label="close"
          >
            <Close />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h4" component="div">
            {title}
          </Typography>
          <Button
            startIcon={<Save />}
            color="inherit"
            variant="outlined"
            onClick={onSave}
          >
            {t("Save")}
          </Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ height: "calc(100vh - 64px)", overflow: "hidden" }}>
        <MarkdownEditor
          initialValue={initialValue}
          onChange={onChange}
        />
      </Box>
    </Dialog>
  );
}