import React from "react";
import {
  Typography,
  IconButton,
  Grid,
  useTheme,
  ThemeProvider,
  Tooltip,
  Icon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { Edit, VisibilityOff, ExpandMore, Info } from "@mui/icons-material";
import { useTranslate } from "../../../translation/translate";
import ReactMarkdown from "react-markdown";

function ThemedSpellTinkererMagitech({ magitech, onEdit, isEditMode }) {
  const { t } = useTranslate();
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.main;
  const ternary = theme.palette.ternary.main;
  const white = theme.palette.white.main;

  const showInPlayerSheet =
    magitech.showInPlayerSheet || magitech.showInPlayerSheet === undefined;

    const ranks = ["Basic", "Advanced", "Superior"];

  return (
    <>
      <div
        style={{
          background: `linear-gradient(to right, ${ternary}, ${white})`,
          padding: "3px 17px",
          display: "flex",
          marginBottom: "5px",
          justifyContent: "space-between",
          borderBottom: `1px solid ${secondary}`,
          borderTop: `1px solid ${secondary}`,
        }}
      >
        <Grid container style={{ flexGrow: 1 }}>
          <Grid
            item
            xs
            flexGrow
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "left",
            }}
          >
            <Typography
              fontWeight="bold"
              style={{ flexGrow: 1, marginRight: "5px" }}
            >
              {t("Current Rank") + ": " + t(ranks[magitech.rank-1])}
            </Typography>
          </Grid>
        </Grid>
        {isEditMode && (
          <Grid
            item
            xs
            style={{ display: "flex", alignItems: "center", flexShrink: 0 }}
          >
            {!showInPlayerSheet && (
              <Tooltip title={t("Magitech not shown in player sheet")}>
                <Icon>
                  <VisibilityOff style={{ color: "black" }} />
                </Icon>
              </Tooltip>
            )}
            <IconButton size="small" onClick={onEdit}>
              <Edit style={{ color: "black" }} />
            </IconButton>
          </Grid>
        )}
      </div>
      {/* Row 1 */}
      {magitech.rank >= 1 && (
        <div
          style={{
            backgroundColor: primary,
            fontFamily: "Antonio",
            fontWeight: "normal",
            fontSize: "1.1em",
            padding: "2px 17px",
            color: white,
            textTransform: "uppercase",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Grid container style={{ flexGrow: 1 }}>
            <Grid
              item
              xs
              flexGrow
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "left",
              }}
            >
              <Typography
                variant="h3"
                style={{ flexGrow: 1, marginRight: "5px" }}
              >
                {t("Magitech Override")}
              </Typography>
            </Grid>
          </Grid>
          {isEditMode && (
            <Grid
              item
              xs
              style={{
                display: "flex",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <div style={{ width: 40, height: 40 }} /> {/* Retain space */}
            </Grid>
          )}
        </div>
      )}

      {/* Row 2 */}

      {/* Row 3 */}
      {magitech.rank >= 1 && (
        <Accordion sx={{ marginY: 1 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Icon sx={{ color: primary, marginRight: 1 }}>
              <Info />
            </Icon>
            <Typography variant="h4">{t("Details")}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <ReactMarkdown>
              {t(
                "You may use an action and spend 10 Mind Points to perform an Opposed **【 INS + INS】** Check against a nearby **soldier**-rank construct you can see (the Game Master must tell you who is a valid target). If you succeed, you gain control of the creature until the end of the scene (the Game Master gives you its profile). You may only control one **construct** at any given time, but may set it free whenever you want; the **construct** is also set free as soon as it is harmed by you or by one of your allies. Once free, the **construct** is again in control of its actions and might turn against you."
              )}
            </ReactMarkdown>
          </AccordionDetails>
        </Accordion>
      )}
      {/* Row 2 */}
      {magitech.rank >= 2 && (
        <div
          style={{
            backgroundColor: primary,
            fontFamily: "Antonio",
            fontWeight: "normal",
            fontSize: "1.1em",
            padding: "2px 17px",
            color: white,
            textTransform: "uppercase",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Grid container style={{ flexGrow: 1 }}>
            <Grid
              item
              xs
              flexGrow
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "left",
              }}
            >
              <Typography
                variant="h3"
                style={{ flexGrow: 1, marginRight: "5px" }}
              >
                {t("Magicannon")}
              </Typography>
            </Grid>
          </Grid>
          {isEditMode && (
            <Grid
              item
              xs
              style={{
                display: "flex",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <div style={{ width: 40, height: 40 }} /> {/* Retain space */}
            </Grid>
          )}
        </div>
      )}

      {/* Row 3 */}
      {magitech.rank >= 2 && (
        <Accordion sx={{ marginY: 1 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Icon sx={{ color: primary, marginRight: 1 }}>
              <Info />
            </Icon>
            <Typography variant="h4">{t("Details")}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <ReactMarkdown>
              {t(
                "You may perform the Inventory action and spend 3 Inventory Points to create a **firearm** weapon known as a **magicannon**. The magicannon will crumble to pieces as soon as you use create a new magicannon. When you create a magicannon, choose the type of damage it deals (**air, bolt, earth, fire, ice,** or **physical**)."
              )}
            </ReactMarkdown>
            <ReactMarkdown>
              {t(
                "*Magicannon | Accuracy: 【DEX + INS】 +1 | Damage: 【HR + 10】| Two-handed | Ranged | No Quality*"
              )}
            </ReactMarkdown>
          </AccordionDetails>
        </Accordion>
      )}
      {/* Row 2 */}
      {magitech.rank >= 3 && (
        <div
          style={{
            backgroundColor: primary,
            fontFamily: "Antonio",
            fontWeight: "normal",
            fontSize: "1.1em",
            padding: "2px 17px",
            color: white,
            textTransform: "uppercase",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Grid container style={{ flexGrow: 1 }}>
            <Grid
              item
              xs
              flexGrow
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "left",
              }}
            >
              <Typography
                variant="h3"
                style={{ flexGrow: 1, marginRight: "5px" }}
              >
                {t("Magispheres")}
              </Typography>
            </Grid>
          </Grid>
          {isEditMode && (
            <Grid
              item
              xs
              style={{
                display: "flex",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <div style={{ width: 40, height: 40 }} /> {/* Retain space */}
            </Grid>
          )}
        </div>
      )}

      {/* Row 3 */}
      {magitech.rank >= 3 && (
        <Accordion sx={{ marginY: 1 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Icon sx={{ color: primary, marginRight: 1 }}>
              <Info />
            </Icon>
            <Typography variant="h4">{t("Details")}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <ReactMarkdown>
              {t(
                "You develop three magisphere prototypes; each of them can replicate a spell chosen from the following lists: **Elementalist**, **Entropist** and **Spiritist**. The spells you choose may come from the same list or different lists. "
              )}
            </ReactMarkdown>
            <ReactMarkdown>
              {t(
                "You also develop two more prototypes upon reaching **level 20**, and another two upon reaching **level 40** (the same applies if you already reached those levels)."
              )}
            </ReactMarkdown>
            <ReactMarkdown>
              {t(
                "You may perform the **Inventory** action and spend 2 Inventory Points to create a **magisphere** and immediately perform the **Spell** action for free, casting one of the spells you have developed a prototype for. The spell follows the normal rules (including MP costs and Magic Checks) and the magisphere is destroyed upon use."
              )}
            </ReactMarkdown>
          </AccordionDetails>
        </Accordion>
      )}
    </>
  );
}

export default function SpellTinkererMagitech(props) {
  const theme = useTheme();
  return (
    <ThemeProvider theme={theme}>
      <ThemedSpellTinkererMagitech {...props} />
    </ThemeProvider>
  );
}
