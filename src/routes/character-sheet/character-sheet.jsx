import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTranslate } from "../../translation/translate";
import { Grid, Button, Typography, Stack } from "@mui/material";
import html2canvas from "html2canvas";
import PlayerCard from "../../components/player/playerSheet/PlayerCard";
import PlayerNumbers from "../../components/player/playerSheet/PlayerNumbers";
import PlayerTraits from "../../components/player/playerSheet/PlayerTraits";
import PlayerBonds from "../../components/player/playerSheet/PlayerBonds";
import PlayerNotes from "../../components/player/playerSheet/PlayerNotes";
import PlayerQuirk from "../../components/player/playerSheet/PlayerQuirk";
import PlayerClasses from "../../components/player/playerSheet/PlayerClasses";
import PlayerEquipment from "../../components/player/playerSheet/PlayerEquipment";
import PlayerSpellsFull from "../../components/player/playerSheet/PlayerSpellsFull";
import PlayerRituals from "../../components/player/playerSheet/PlayerRituals";
import PlayerCompanion from "../../components/player/playerSheet/PlayerCompanion";
import powered_by_fu from "../powered_by_fu.png";
import Layout from "../../components/Layout";
import { Download } from "@mui/icons-material";
import PlayerCardShort from "../../components/player/playerSheet/PlayerCardShort";
import { getPc } from "../../utility/db";
import { useTheme } from "@mui/material/styles";
import useDownload from "../../hooks/useDownload";

export default function CharacterSheet() {
  const { t } = useTranslate();
  const { playerId } = useParams();
  const theme = useTheme();
  const [download, snackbar] = useDownload();

  const [player, setPlayer] = useState(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [fullCharacterSheet, setFullCharacterSheet] = useState(true);

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const playerData = await getPc(parseInt(playerId, 10)); // Ensure playerId is a number
        setPlayer(playerData);
      } catch (error) {
        console.error("Error fetching player data:", error);
      }
    };

    fetchPlayer();
  }, [playerId]);

  useEffect(() => {
    if (player) {
      const images = document.querySelectorAll("img");
      const promises = [];

      images.forEach((image) => {
        if (!image.complete) {
          promises.push(
            new Promise((resolve) => {
              image.onload = resolve;
            })
          );
        }
      });

      Promise.all(promises).then(() => {
        setImagesLoaded(true);
      });

      // Clean up
      return () => {
        images.forEach((image) => {
          image.onload = null;
        });
      };
    }
  }, [player]);

  const takeScreenshot = async () => {
    if (!imagesLoaded) return;

    const element = document.getElementById(
      fullCharacterSheet ? "character-sheet" : "character-sheet-short"
    );

    if (!element) return;

    // Save original styles
    const originalStyles = {
      width: element.style.width,
      transform: element.style.transform,
      transformOrigin: element.style.transformOrigin,
      backgroundColor: element.style.backgroundColor
    };

    // Calculate the scale factor (2000px for full sheet, 1000px for short)
    const targetWidth = fullCharacterSheet ? 2000 : 1000;
    const currentWidth = element.offsetWidth;
    const scale = targetWidth / currentWidth;

    try {
      // Apply scaling transformation
      element.style.transform = `scale(${scale})`;
      element.style.transformOrigin = 'top left';
      element.style.backgroundColor =
        theme.palette.mode === "dark" ? theme.palette.background.default : "#ffffff";

      const canvas = await html2canvas(element, {
        useCORS: true,
        allowTaint: true,
        logging: true,
        width: targetWidth,
        height: Math.ceil(element.offsetHeight * scale),
        scale: 1, // We're handling scaling manually
      });
      
      const imgData = canvas.toDataURL("image/png");

      // Restore original styles
      element.style.width = originalStyles.width;
      element.style.transform = originalStyles.transform;
      element.style.transformOrigin = originalStyles.transformOrigin;
      element.style.backgroundColor = originalStyles.backgroundColor;

      await download(imgData, player.name + "_sheet.png");
    } catch (error) {
      console.error("Error capturing screenshot:", error);
      // Restore original styles even if there's an error
      element.style.width = originalStyles.width;
      element.style.transform = originalStyles.transform;
      element.style.transformOrigin = originalStyles.transformOrigin;
      element.style.backgroundColor = originalStyles.backgroundColor;
    }
  };

  if (!player) {
    return <div>Loading...</div>;
  }

  return (
    <Layout fullWidth={true}>
      <Grid container spacing={1} sx={{ paddingX: 1 }}>
        <Grid item xs={10}>
          <Button
            variant="contained"
            color="primary"
            onClick={takeScreenshot}
            style={{ marginBottom: "16px", width: "100%" }} // Add margin to separate from grid
            startIcon={<Download />}
          >
            {t("Download Character Sheet")}
          </Button>
        </Grid>
        <Grid item xs={2}>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => setFullCharacterSheet(!fullCharacterSheet)}
            style={{ marginBottom: "16px", width: "100%" }} // Add margin to separate from grid
          >
            {fullCharacterSheet
              ? t("Short Character Sheet")
              : t("Full Character Sheet")}
          </Button>
        </Grid>
      </Grid>
      {fullCharacterSheet ? (
        <Grid container spacing={2} sx={{ padding: 1 }} id="character-sheet">
          <Grid container item xs={12} md={6} spacing={2}>
            <Grid item xs={12}>
              <Stack direction="column" spacing={2}>
                <PlayerCard
                  player={player}
                  isCharacterSheet={true}
                  characterImage={player.info.imgurl}
                />
                <PlayerNumbers player={player} isCharacterSheet={true} />
                <PlayerTraits player={player} isCharacterSheet={true} />
                <PlayerBonds player={player} isCharacterSheet={true} />
                <PlayerRituals player={player} isCharacterSheet={true} />
                <PlayerEquipment player={player} isCharacterSheet={true} />
                <PlayerNotes player={player} isCharacterSheet={true} />
              </Stack>
            </Grid>
          </Grid>
          <Grid container item xs={12} md={6} spacing={2}>
            <Grid item xs={12}>
              <Stack direction="column" spacing={2}>
                <PlayerClasses player={player} isCharacterSheet={true} />
                <PlayerQuirk player={player} isCharacterSheet={true} />
              </Stack>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <PlayerSpellsFull player={player} isCharacterSheet={true} />
          </Grid>
          <Grid item xs={6}>
            <PlayerCompanion player={player} isCharacterSheet={true} />
          </Grid>
          <Grid container item xs={12}>
            <Grid item xs={4}>
              <img
                src={powered_by_fu}
                alt="Powered by Fu"
                style={{ width: "100%", maxWidth: "15rem" }}
                onLoad={() => setImagesLoaded(true)}
              />
            </Grid>
            <Grid item xs={4}>
              <Typography variant="h4" align="center">
                <span
                  style={{
                    fontWeight: "bolder",
                    fontSize: "1.6em",
                    textTransform: "uppercase",
                    verticalAlign: "middle",
                  }}
                >
                  {t("Made with Fultimator")}
                </span>
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      ) : (
        <Grid
          container
          sx={{ padding: 1 }}
          justifyContent={"center"}
          id="character-sheet-short"
        >
          <Grid container item xs={12}>
            <PlayerCardShort
              player={player}
              isCharacterSheet={true}
              characterImage={player.info.imgurl}
            />
          </Grid>
        </Grid>
      )}
      {snackbar}
    </Layout>
  );
}
