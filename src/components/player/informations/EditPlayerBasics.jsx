import React, { useCallback, useState } from "react";
import { Add, Remove } from "@mui/icons-material";
import {
  FormControl,
  Grid,
  IconButton,
  TextField,
  useTheme,
  Paper,
  Button,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";
import { useTranslate } from "../../../translation/translate";
import CustomTextarea from "../../common/CustomTextarea";
import CustomHeader from "../../common/CustomHeader";
import ZenitIcon from "../../svgs/zenit.svg?react";
import ExpIcon from "../../svgs/exp.svg?react";
import ExpDisabledIcon from "../../svgs/exp_disabled.svg?react";
import FabulaIcon from "../../svgs/fabula.svg?react";
import ReactMarkdown from "react-markdown";
import Confetti from "react-confetti";
import { ImageHandler } from "./ImageHandler";

export default function EditPlayerBasics({
  player,
  setPlayer,
  updateMaxStats,
  isEditMode,
}) {
  const { t } = useTranslate();
  const theme = useTheme();
  const secondary = theme.palette.secondary.main;

  const [showConfetti, setShowConfetti] = useState(false);

  const onChange = useCallback(
    (key) => (e) => {
      setPlayer((prevState) => ({
        ...prevState,
        [key]: e.target.value,
      }));
    },
    [setPlayer]
  );

  const onChangeInfo = useCallback(
    (key) => (value) => {
      setPlayer((prevState) => ({
        ...prevState,
        info: {
          ...prevState.info,
          [key]: value,
        },
      }));
    },
    [setPlayer]
  );

  const handleLevelUp = () => {
    setShowConfetti(true);
  };

  const handleCloseLevelUp = () => {
    setShowConfetti(false);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: "15px",
        borderRadius: "8px",
        border: "2px solid",
        borderColor: secondary,
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <CustomHeader
            type="top"
            headerText={t("Basic Information")}
            //addItem={() => console.log(player)}
            //icon={Code}
            //customTooltip="Console.log Player Object"
            showIconButton = {false}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl variant="standard" fullWidth>
            <TextField
              id="name"
              label={t("Name") + ":"}
              value={player.name}
              onChange={onChange("name")}
              InputProps={{
                readOnly: !isEditMode,
              }}
              inputProps={{ maxLength: 50 }} // Set the maximum length to 50 characters
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl variant="standard" fullWidth>
            <TextField
              id="pronouns"
              label={t("Pronouns") + ":"}
              value={player.info.pronouns}
              onChange={(e) => onChangeInfo("pronouns")(e.target.value)}
              InputProps={{
                readOnly: !isEditMode,
              }}
              inputProps={{ maxLength: 15 }}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <EditPlayerLevel
            player={player}
            setPlayer={setPlayer}
            isEditMode={isEditMode}
            updateMaxStats={updateMaxStats}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl variant="standard" fullWidth>
            <CustomTextarea
              id="description"
              label={t("Description") + ":"}
              value={player.info.description}
              onChange={(e) => onChangeInfo("description")(e.target.value)}
              readOnly={!isEditMode}
              maxRows={10}
              maxLength={5000}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl variant="standard" fullWidth>
            <TextField
              id="fabulapoints"
              label={t("Fabula Points") + ":"}
              value={player.info.fabulapoints.toString()}
              onChange={(e) => {
                const value = e.target.value;
                if (
                  value === "" ||
                  (/^\d+$/.test(value) && +value >= 0 && +value <= 9999)
                ) {
                  onChangeInfo("fabulapoints")(
                    value === "" ? 0 : parseInt(value, 10)
                  );
                }
              }}
              onBlur={(e) => {
                let value = parseInt(e.target.value, 10);
                if (isNaN(value) || value < 0) {
                  value = 0;
                } else if (value > 9999) {
                  value = 9999;
                }
                onChangeInfo("fabulapoints")(value);
              }}
              type="number"
              InputProps={{
                readOnly: !isEditMode,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton>
                      <FabulaIcon style={{ width: "28px", height: "28px" }} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl variant="standard" fullWidth>
            <TextField
              id="exp"
              label={t("Exp") + ":"}
              value={player.info.exp.toString()}
              onChange={(e) => {
                const value = e.target.value;
                if (
                  value === "" ||
                  (/^\d+$/.test(value) && +value >= 0 && +value <= 9999)
                ) {
                  onChangeInfo("exp")(value === "" ? 0 : parseInt(value, 10));
                }
              }}
              onBlur={(e) => {
                let value = parseInt(e.target.value, 10);
                if (isNaN(value) || value < 0) {
                  value = 0;
                }
                onChangeInfo("exp")(value);
              }}
              type="number"
              InputProps={{
                readOnly: !isEditMode,
                endAdornment: (
                  <ExpAdornment
                    exp={player.info.exp}
                    isEditMode={isEditMode}
                    player={player}
                    setPlayer={setPlayer}
                    onLevelUp={handleLevelUp}
                    onCloseLevelUp={handleCloseLevelUp}
                  />
                ),
              }}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl variant="standard" fullWidth>
            <TextField
              id="zenit"
              label={t("Zenit") + ":"}
              value={player.info.zenit.toString()}
              onChange={(e) => {
                const value = e.target.value;
                if (
                  value === "" ||
                  (/^\d+$/.test(value) && +value >= 0 && +value <= 99999999)
                ) {
                  onChangeInfo("zenit")(value === "" ? 0 : parseInt(value, 10));
                }
              }}
              type="number"
              InputProps={{
                readOnly: !isEditMode,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton>
                      <ZenitIcon style={{ width: "28px", height: "28px" }} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <ImageHandler
            player={player}
            setPlayer={setPlayer}
            isEditMode={isEditMode}
          />
        </Grid>
      </Grid>
      {showConfetti && <Confetti />}
    </Paper>
  );
}

function EditPlayerLevel({ player, setPlayer, isEditMode, updateMaxStats }) {
  const { t } = useTranslate();

  const onRaiseLevel = () => {
    setPlayer((prevState) => {
      if (prevState.lvl >= 50) return prevState;
      return { ...prevState, lvl: prevState.lvl + 1 };
    });
    updateMaxStats();
  };

  const onLowerLevel = () => {
    setPlayer((prevState) => {
      if (prevState.lvl <= 5) return prevState;
      return { ...prevState, lvl: prevState.lvl - 1 };
    });
    updateMaxStats();
  };

  return (
    <FormControl variant="standard" fullWidth>
      <TextField
        id="level"
        label={t("Level") + ":"}
        sx={{ width: "100%" }}
        value={player.lvl}
        InputProps={{
          readOnly: true,
          startAdornment: (
            <IconButton
              aria-label="decrease level"
              edge="start"
              onClick={onLowerLevel}
              disabled={!isEditMode}
            >
              <Remove />
            </IconButton>
          ),
          endAdornment: (
            <IconButton
              aria-label="increase level"
              edge="end"
              onClick={onRaiseLevel}
              disabled={!isEditMode}
            >
              <Add />
            </IconButton>
          ),
        }}
      />
    </FormControl>
  );
}

function ExpAdornment({
  exp,
  isEditMode,
  player,
  setPlayer,
  onLevelUp,
  onCloseLevelUp,
}) {
  const [levelUpDialogOpen, setLevelUpDialogOpen] = useState(false);
  const [levelUpCelebrationOpen, setLevelUpCelebrationOpen] = useState(false);
  const { t } = useTranslate();

  const handleExpClick = () => {
    if (exp >= 10 && isEditMode) {
      setLevelUpDialogOpen(true);
    }
  };

  const handleLevelUpConfirm = () => {
    setPlayer((prevPlayer) => ({
      ...prevPlayer,
      lvl: prevPlayer.lvl + 1,
      info: {
        ...prevPlayer.info,
        exp: prevPlayer.info.exp - 10,
      },
    }));
    setLevelUpDialogOpen(false);
    setLevelUpCelebrationOpen(true);

    onLevelUp();
  };

  const handleClose = () => {
    setLevelUpDialogOpen(false);
    setLevelUpCelebrationOpen(false);

    onCloseLevelUp();
  };

  return (
    <>
      <InputAdornment position="end">
        <IconButton
          onClick={handleExpClick}
          sx={{
            animation: exp >= 10 ? "flash 1s infinite" : "none",
            cursor: exp >= 10 && isEditMode ? "pointer" : "default",
          }}
          disabled={!isEditMode}
        >
          {exp >= 10 ? (
            <ExpIcon
              style={{
                width: "28px",
                height: "28px",
                color: "gold",
              }}
            />
          ) : (
            <ExpDisabledIcon
              style={{
                width: "28px",
                height: "28px",
                color: "gray",
              }}
            />
          )}
        </IconButton>
      </InputAdornment>
      <Dialog
        open={levelUpDialogOpen}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: "80%",
            maxWidth: "md",
          },
        }}
      >
        <DialogTitle variant="h3" sx={{ fontWeight: "bold" }}>
          {t("Level Up Confirmation")}
        </DialogTitle>
        <DialogContent>
          <p>{t("Do you want to use 10 EXP to level up?")}</p>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={handleClose} color="error">
            {t("Cancel")}
          </Button>
          <Button
            variant="contained"
            onClick={handleLevelUpConfirm}
            color="primary"
          >
            {t("Level Up")}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={levelUpCelebrationOpen}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: "80%",
            maxWidth: "lg",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.5rem" }}>
          {t("New Level Reached!")}
        </DialogTitle>
        <DialogContent>
          <ul>
            <li>
              <ReactMarkdown>
                {t(
                  "You may change your character's **Identity** and/or **Theme**."
                )}
              </ReactMarkdown>
            </li>
            <li>
              <ReactMarkdown>
                {t(
                  "Your maximum **Hit Points** and **Mind Points** has increased by **one** point each. Note that this does **not** affect your current Hit Points and Mind Points."
                )}
              </ReactMarkdown>
            </li>
            {(player.lvl === 20 || player.lvl === 40) && (
              <li>
                <ReactMarkdown>
                  {t("You reached LVL") +
                    " **" +
                    player.lvl +
                    "**. " +
                    t(
                      "You may choose one of your **Attributes** and increase its base die size by one step, up to a maximum of **d12**."
                    )}
                </ReactMarkdown>
              </li>
            )}
            <li>
              <ReactMarkdown>
                {t(
                  "You may increase the level of one of your character's Classes by one, or you gain your first level in a Class you didn't already have."
                )}
              </ReactMarkdown>
            </li>
          </ul>

          <Typography>
            {t(
              "There are, however, two important limitations when leveling up:"
            )}
          </Typography>
          <ul>
            <li>
              <ReactMarkdown>
                {t(
                  "You can never have more than ten levels in a Class. Once you put the tenth level in a Class, that Class has been **mastered** (which grants you a **Heroic Skill**) and you can no longer invest levels into it."
                )}
              </ReactMarkdown>
            </li>
            <li>
              <ReactMarkdown>
                {t(
                  "You can never have more than **three non-mastered Classes**. If you want to further diversify your character, you must first master some of the Classes you acquired."
                )}
              </ReactMarkdown>
            </li>
          </ul>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={handleClose} color="primary">
            {t("OK")}
          </Button>
        </DialogActions>
      </Dialog>
      <style>
        {`
          @keyframes flash {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </>
  );
}
