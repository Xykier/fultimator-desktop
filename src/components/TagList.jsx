import React, { useState, useEffect } from "react";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Autocomplete from "@mui/material/Autocomplete";
import { useTheme } from "@mui/system";
import { useTranslate } from "../translation/translate";
import AddIcon from "@mui/icons-material/Add";
import { getNpcTagList } from "../utility/db";

const TagList = ({ npc, setNpc }) => {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;

  const [inputValue, setInputValue] = useState("");
  const [autocompleteValue, setAutocompleteValue] = useState(null);
  const [availableTags, setAvailableTags] = useState([]);
  const maxTags = 5; // Maximum tag count
  const maxTagLength = 50; // Maximum tag length
  const maxVisibleTags = 5; // Maximum visible tags in autocomplete

  // Fetch available tags when component mounts
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const fetchedTags = await getNpcTagList();
        const filteredTags = fetchedTags
          .map((tag) => tag.name)
          .filter(
            (tag) =>
              !npc.tags?.some(
                (existingTag) =>
                  existingTag.name.toUpperCase() === tag.toUpperCase()
              )
          );

        // Sort tags based on input
        const sortedTags = inputValue.trim()
          ? filteredTags.sort((a, b) => a.localeCompare(b)) // Sort alphabetically
          : filteredTags; // No need to sort by usageCount if it doesn't exist

        setAvailableTags(sortedTags);
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };
    fetchTags();
  }, [npc.tags, inputValue]);

  // Function to handle deletion of a tag
  const handleDelete = (i) => {
    return () => {
      setNpc((prevState) => {
        const newState = {
          ...prevState,
          tags: [...prevState.tags.slice(0, i), ...prevState.tags.slice(i + 1)],
        };
        return newState;
      });
    };
  };

  // Function to handle adding a tag
  const handleAddTag = (newTagName) => {
    const trimmedValue = (
      typeof newTagName === "string"
        ? newTagName
        : newTagName?.label || inputValue
    )
      .trim()
      .toUpperCase();

    if (
      trimmedValue &&
      (npc.tags?.length < maxTags || !npc.tags) &&
      !npc.tags?.some(
        (tag) => tag.name.toUpperCase() === trimmedValue.toUpperCase()
      )
    ) {
      setNpc((prevState) => {
        const newState = {
          ...prevState,
          tags: prevState.tags
            ? [...prevState.tags, { name: trimmedValue }]
            : [{ name: trimmedValue }],
        };
        return newState;
      });

      // Reset input and autocomplete values
      setInputValue("");
      setAutocompleteValue(null);
    }
  };

  // Check if the input field is disabled
  const isInputDisabled = npc.tags?.length >= maxTags;

  // Calculate remaining selectable tags
  const remainingSelectableTags = availableTags.length - maxVisibleTags;

  return (
    <Paper
      elevation={3}
      sx={{
        p: "10px",
        borderRadius: "8px",
        border: "2px solid",
        borderColor: secondary,
      }}
    >
      {/* Label for the tag list */}
      <Typography
        mb={1}
        sx={{
          fontFamily: "Antonio",
          textTransform: "uppercase",
          fontSize: "1.3rem",
        }}
      >
        {t("Personal Tags")}
      </Typography>
      {/* Stack for input field and add button */}
      <Stack direction="row" spacing={1} alignItems="flex-start">
        {/* Autocomplete for adding tags */}
        <Autocomplete
          fullWidth
          freeSolo
          disabled={isInputDisabled}
          options={[
            ...availableTags.slice(0, maxVisibleTags),
            ...(remainingSelectableTags > 0
              ? [
                  {
                    label: "+ " + remainingSelectableTags + " " + t("more_tags"),
                    disabled: true,
                  },
                ]
              : []),
          ]}
          value={autocompleteValue}
          onChange={(_, newValue) => {
            // Only add tag if it's a valid selection and not a disabled option
            if (newValue && !newValue.disabled) {
              // Set input value and autocomplete value to prevent double tag creation
              setInputValue(newValue.label || newValue);
              setAutocompleteValue(newValue);
              handleAddTag(newValue);
            }
          }}
          inputValue={inputValue}
          onInputChange={(_, newInputValue) => {
            setInputValue(newInputValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={
                isInputDisabled
                  ? t("reached_tag_limit_placeholder")
                  : t("add_select_tag_placeholder")
              }
              variant="outlined"
              size="small"
              inputProps={{
                ...params.inputProps,
                maxLength: maxTagLength,
              }}
              sx={{ height: "40px" }}
            />
          )}
          renderOption={(props, option) => (
            <li
              {...props}
              style={{
                ...(option.disabled
                  ? {
                      color: "gray",
                      cursor: "default",
                      pointerEvents: "none",
                    }
                  : {}),
              }}
            >
              {option.label || option}
            </li>
          )}
        />
        {/* Button to add tags */}
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() => handleAddTag(inputValue)}
          disabled={isInputDisabled || !inputValue.trim()}
          sx={{
            height: "40px",
            display: isInputDisabled ? "none" : "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "0 16px",
          }}
        >
          <AddIcon />
        </Button>
      </Stack>
      {/* Container for displaying added tags */}
      <div style={{ marginTop: "8px" }}>
        {npc.tags?.map((tag, i) => (
          <Chip
            key={i}
            label={tag.name.toUpperCase()}
            onDelete={handleDelete(i)}
            color="primary"
            variant={theme.palette.mode === "dark" ? "contained" : "outlined"}
            style={{ marginRight: "5px", marginBottom: "5px" }}
          />
        ))}
      </div>
    </Paper>
  );
};

export default TagList;
