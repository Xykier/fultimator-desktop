import React, { useState, useRef } from "react";
import {
  Box,
  TextField,
  Button,
  ButtonGroup,
  IconButton,
  Tooltip,
  Paper,
  Tabs,
  Tab,
  Typography,
  Popover,
  useMediaQuery,
} from "@mui/material";
import {
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  Title,
  Link as LinkIcon,
  TableChart,
  FormatColorText,
  HorizontalRule,
  TextFields,
} from "@mui/icons-material";
import NotesMarkdown from "./NotesMarkdown"; // Using your existing component for preview
import { useTheme } from "@mui/material/styles";

const MarkdownEditor = ({ initialValue = "", onChange }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [value, setValue] = useState(initialValue);
  const [view, setView] = useState("edit"); // 'edit' or 'preview'
  const [anchorEl, setAnchorEl] = useState(null);
  const [popoverContent, setPopoverContent] = useState(null);
  const textFieldRef = useRef(null);

  const handleChange = (event) => {
    const newValue = event.target.value;
    setValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleTabChange = (event, newValue) => {
    setView(newValue);
  };

  const insertAtCursor = (prefix, suffix = "") => {
    const textField = textFieldRef.current;
    if (!textField) return;

    const start = textField.selectionStart;
    const end = textField.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText =
      value.substring(0, start) +
      prefix +
      selectedText +
      suffix +
      value.substring(end);

    setValue(newText);
    if (onChange) onChange(newText);

    // Set cursor position after the operation
    setTimeout(() => {
      textField.focus();
      textField.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 0);
  };

  const handlePopoverOpen = (event, content) => {
    setAnchorEl(event.currentTarget);
    setPopoverContent(content);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
    setPopoverContent(null);
  };

  const buttons = [
    {
      tooltip: "Bold",
      icon: <FormatBold />,
      action: () => insertAtCursor("**", "**"),
    },
    {
      tooltip: "Italic",
      icon: <FormatItalic />,
      action: () => insertAtCursor("*", "*"),
    },
    {
      tooltip: "Heading 1",
      icon: <Title sx={{ transform: "scale(1.2)" }} />,
      action: () => insertAtCursor("# "),
    },
    {
      tooltip: "Heading 2",
      icon: <Title />,
      action: () => insertAtCursor("## "),
    },
    {
      tooltip: "Heading 3",
      icon: <Title sx={{ transform: "scale(0.9)" }} />,
      action: () => insertAtCursor("### "),
    },
    {
      tooltip: "Heading 4",
      icon: <Title sx={{ transform: "scale(0.8)" }} />,
      action: () => insertAtCursor("#### "),
    },
    {
      tooltip: "Heading 5",
      icon: <Title sx={{ transform: "scale(0.7)" }} />,
      action: () => insertAtCursor("##### "),
    },
    {
      tooltip: "Bullet List",
      icon: <FormatListBulleted />,
      action: () => insertAtCursor("- "),
    },
    {
      tooltip: "Numbered List",
      icon: <FormatListNumbered />,
      action: () => insertAtCursor("1. "),
    },
    {
      tooltip: "Blockquote",
      icon: <FormatQuote />,
      action: () => insertAtCursor("> "),
    },
    {
      tooltip: "Link",
      icon: <LinkIcon />,
      action: () => insertAtCursor("[", "](url)"),
    },
    {
      tooltip: "Japanese Brackets 【】",
      icon: (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: "16px",
            width: "24px",
            height: "24px",
            position: "relative",
            top: "0px", // Adjust this value as needed, try -1px or -2px if needed
            lineHeight: 1,
          }}
        >
          【】
        </Box>
      ),
      action: () => insertAtCursor("【", "】"),
    },
    {
      tooltip: "Table",
      icon: <TableChart />,
      action: (event) =>
        handlePopoverOpen(
          event,
          <Box p={2} sx={{ width: 300 }}>
            <Typography variant="subtitle2" gutterBottom>
              Insert Table
            </Typography>

            {/* Predefined table sizes */}
            <Typography variant="body2" sx={{ mb: 1 }}>
              Quick tables:
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
              {[
                { size: "2×2", cols: 2, rows: 2 },
                { size: "2×3", cols: 2, rows: 3 },
                { size: "3×2", cols: 3, rows: 2 },
                { size: "3×3", cols: 3, rows: 3 },
                { size: "3×4", cols: 3, rows: 4 },
                { size: "4×3", cols: 4, rows: 3 },
                { size: "4×4", cols: 4, rows: 4 },
                { size: "4×5", cols: 4, rows: 5 },
                { size: "5×4", cols: 5, rows: 4 },
              ].map(({ size, cols, rows }) => (
                <Button
                  key={size}
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    // Generate table based on dimensions
                    const header =
                      "| " +
                      Array(cols)
                        .fill(0)
                        .map((_, i) => `Header ${i + 1}`)
                        .join(" | ") +
                      " |";
                    const separator =
                      "| " + Array(cols).fill("---").join(" | ") + " |";
                    const tableRows = Array(rows)
                      .fill(0)
                      .map(
                        (_, rowIdx) =>
                          "| " +
                          Array(cols)
                            .fill(0)
                            .map(
                              (_, colIdx) =>
                                `Row ${rowIdx + 1}, Col ${colIdx + 1}`
                            )
                            .join(" | ") +
                          " |"
                      )
                      .join("\n");

                    insertAtCursor(`${header}\n${separator}\n${tableRows}`);
                    handlePopoverClose();
                  }}
                >
                  {size}
                </Button>
              ))}
            </Box>

            {/* Custom table builder */}
            <Typography variant="body2" sx={{ mb: 1 }}>
              Custom size:
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 2,
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <TextField
                  id="table-cols"
                  label="Columns"
                  type="number"
                  size="small"
                  defaultValue={3}
                  inputProps={{ min: 1, max: 10 }}
                  sx={{ width: 90, mr: 1 }}
                />
                <Typography>×</Typography>
                <TextField
                  id="table-rows"
                  label="Rows"
                  type="number"
                  size="small"
                  defaultValue={3}
                  inputProps={{ min: 1, max: 20 }}
                  sx={{ width: 90, ml: 1 }}
                />
              </Box>
              <Button
                variant="contained"
                size="small"
                onClick={() => {
                  const cols =
                    parseInt(document.getElementById("table-cols").value) || 3;
                  const rows =
                    parseInt(document.getElementById("table-rows").value) || 3;

                  // Generate table based on input dimensions
                  const header =
                    "| " +
                    Array(cols)
                      .fill(0)
                      .map((_, i) => `Header ${i + 1}`)
                      .join(" | ") +
                    " |";
                  const separator =
                    "| " + Array(cols).fill("---").join(" | ") + " |";
                  const tableRows = Array(rows)
                    .fill(0)
                    .map(
                      (_, rowIdx) =>
                        "| " +
                        Array(cols)
                          .fill(0)
                          .map(
                            (_, colIdx) => `Cell ${rowIdx + 1},${colIdx + 1}`
                          )
                          .join(" | ") +
                        " |"
                    )
                    .join("\n");

                  insertAtCursor(`${header}\n${separator}\n${tableRows}`);
                  handlePopoverClose();
                }}
              >
                Create
              </Button>
            </Box>

            {/* Option for empty table with just headers */}
            <Button
              variant="text"
              size="small"
              fullWidth
              onClick={() => {
                const cols =
                  parseInt(document.getElementById("table-cols").value) || 3;

                // Generate table with empty cells
                const header =
                  "| " +
                  Array(cols)
                    .fill(0)
                    .map((_, i) => `Header ${i + 1}`)
                    .join(" | ") +
                  " |";
                const separator =
                  "| " + Array(cols).fill("---").join(" | ") + " |";
                const emptyRow = "| " + Array(cols).fill("").join(" | ") + " |";

                insertAtCursor(
                  `${header}\n${separator}\n${emptyRow}\n${emptyRow}\n${emptyRow}`
                );
                handlePopoverClose();
              }}
            >
              Create empty table
            </Button>
          </Box>
        ),
    },
    {
      tooltip: "Horizontal Rule",
      icon: <HorizontalRule />,
      action: () => insertAtCursor("\n---\n"),
    },
    {
      tooltip: "Callout Blocks",
      icon: <FormatColorText />,
      action: (event) =>
        handlePopoverOpen(
          event,
          <Box p={2} sx={{ maxWidth: 300 }}>
            <Typography variant="subtitle2" gutterBottom>
              Insert Callout Block
            </Typography>
            <ButtonGroup orientation="vertical" variant="outlined" fullWidth>
              {[
                "primary",
                "secondary",
                "ternary",
                "quaternary",
                "warning",
                "info",
                "success",
                "danger",
              ].map((type) => (
                <Button
                  key={type}
                  color={type === "danger" ? "error" : type}
                  variant="contained"
                  onClick={() => {
                    insertAtCursor(`{{${type} `, "}}\n");
                    handlePopoverClose();
                  }}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </ButtonGroup>
          </Box>
        ),
    },
  ];

  const cheatSheet = (
    <Box p={2} sx={{ width: 400, maxHeight: 600, overflow: "auto" }}>
      <Typography variant="h6" gutterBottom>
        Markdown Cheat Sheet
      </Typography>

      <Typography variant="subtitle1" sx={{ mt: 2 }}>
        Basic Syntax
      </Typography>
      <Box
        component="pre"
        sx={{ bgcolor: "background.paper", p: 1, borderRadius: 1 }}
      >
        # Heading 1 ## Heading 2 ### Heading 3 #### Heading 4 ##### Heading 5
        **Bold text** *Italic text* - Bullet point 1. Numbered list
        {">"} Blockquote [Link text](URL) --- Horizontal rule 【Bracketed text】
      </Box>

      <Typography variant="subtitle1" sx={{ mt: 2 }}>
        Custom Callout Blocks
      </Typography>
      <Box
        component="pre"
        sx={{ bgcolor: "background.paper", p: 1, borderRadius: 1 }}
      >
        {"{{primary This is a primary callout}}"}

        {"{{secondary Secondary callout text}}"}

        {"{{warning Warning message!}}"}

        {"{{info Information block}}"}

        {"{{success Success message}}"}

        {"{{danger Danger/error message}}"}

        {"{{ternary Ternary styling}}"}

        {"{{quaternary Quaternary styling}}"}
      </Box>
    </Box>
  );

  return (
    <Paper elevation={3} sx={{ mb: 4, width: "100%", height: "100%" }}>
      <Tabs
        value={view}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="inherit"
        variant="fullWidth"
        sx={{
          backgroundColor: isDark
            ? theme.palette.background.paper
            : theme.palette.grey[100],
          color: isDark ? theme.palette.grey[100] : theme.palette.text.primary,
          borderRadius: 1,
          boxShadow: isDark
            ? "0 2px 4px rgba(0,0,0,0.6)"
            : "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <Tab value="edit" label="Edit" />
        <Tab value="preview" label="Preview" />
        {!isMobile && <Tab value="split" label="Split View" />}
      </Tabs>

      <Box p={2}>
        <Box sx={{ display: "flex", flexWrap: "wrap", mb: 1 }}>
          {buttons.map((btn, idx) => (
            <Tooltip key={idx} title={btn.tooltip}>
              <IconButton
                size="small"
                onClick={
                  typeof btn.action === "function" ? btn.action : undefined
                }
                sx={{ mr: 0.5, mb: 0.5 }}
              >
                {btn.icon}
              </IconButton>
            </Tooltip>
          ))}
          <Tooltip title="Markdown Cheat Sheet">
            <IconButton
              size="small"
              onClick={(e) => handlePopoverOpen(e, cheatSheet)}
              sx={{ mr: 0.5, mb: 0.5 }}
            >
              <TextFields />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ display: view === "split" ? "flex" : "block", gap: 2 }}>
          {(view === "edit" || view === "split") && (
            <TextField
              inputRef={textFieldRef}
              multiline
              fullWidth
              minRows={10}
              maxRows={30}
              value={value}
              onChange={handleChange}
              variant="outlined"
              placeholder="Write your text here..."
              sx={{
                fontFamily: "monospace",
                flex: view === "split" ? 1 : "auto",
                "& .MuiInputBase-root": {
                  fontFamily: "monospace",
                },
              }}
            />
          )}

          {(view === "preview" || view === "split") && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                minHeight: "238px",
                flex: view === "split" ? 1 : "auto",
                maxHeight: "calc(100vh - 200px)",
                overflow: "auto",
              }}
            >
              <NotesMarkdown>{value}</NotesMarkdown>
            </Paper>
          )}
        </Box>
      </Box>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        {popoverContent}
      </Popover>
    </Paper>
  );
};

export default MarkdownEditor;
