import React from "react";
import {
  Typography,
  IconButton,
  Grid,
  ThemeProvider,
  Icon,
  Tooltip,
} from "@mui/material";
import { Edit, VisibilityOff, SettingsSuggest } from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import { OffensiveSpellIcon } from "../../icons"; // Ensure this path is correct
import attributes from "../../../libs/attributes";
import { CloseBracket, OpenBracket } from "../../Bracket";
import { useTranslate } from "../../../translation/translate";
import { useCustomTheme } from "../../../hooks/useCustomTheme";

const StyledMarkdown = ({ children, ...props }) => {
    return (
      <div style={{ whiteSpace: "pre-line", display: "inline", margin: 0, padding: 1 }}>
        <ReactMarkdown
          {...props}
          components={{
            p: (props) => <p style={{ margin: 0, padding: 0 }} {...props} />,
            ul: (props) => <ul style={{ margin: 0, padding: 0 }} {...props} />,
            li: (props) => <li style={{ margin: 0, padding: 0 }} {...props} />,
            strong: (props) => (
              <strong style={{ fontWeight: "bold" }} {...props} />
            ),
            em: (props) => <em style={{ fontStyle: "italic" }} {...props} />,
          }}
        >
          {children}
        </ReactMarkdown>
      </div>
    );
  };

function ThemedSpellDefault({
  spellName,
  mp,
  maxTargets,
  targetDesc,
  duration,
  description,
  onEdit,
  isOffensive,
  attr1,
  attr2,
  showInPlayerSheet,
  isMagisphere,
  isEditMode,
  index,
}) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";
  const iconColor = isDarkMode ? '#ffffff' : '#000000';
  const gradientColor = isDarkMode ? '#1f1f1f' : '#fff';

  return (
    <>
      {/* Row 1 */}
      {index === 0 && (
        <div
          style={{
            backgroundColor: theme.primary,
            fontFamily: "Antonio",
            fontWeight: "normal",
            fontSize: "1.1em",
            padding: "2px 17px",
            color: theme.white,
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
                {t("Spell")}
              </Typography>
            </Grid>
            <Grid
              item
              xs={2}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="h3">{t("MP")}</Typography>
            </Grid>
            <Grid
              item
              xs={3}
              sm={4}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="h3">{t("Target")}</Typography>
            </Grid>
            <Grid
              item
              xs={4}
              sm={3}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="h3">{t("Duration")}</Typography>
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
      <div
        style={{
          background: `linear-gradient(to right, ${theme.ternary}, ${gradientColor})`,
          padding: "3px 17px",
          display: "flex",
          justifyContent: "space-between",
          borderTop: `1px solid ${theme.secondary}`,
          borderBottom: `1px solid ${theme.secondary}`,
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
              fontSize={{ xs: "0.8rem", sm: "1rem" }}
            >
              {isMagisphere && (
                <Tooltip title={t("Magisphere")}>
                  <SettingsSuggest sx={{ fontSize: "1rem" }} />
                </Tooltip>
              )}{" "}
              {spellName} {isOffensive && <OffensiveSpellIcon />}
            </Typography>
          </Grid>
          <Grid
            item
            xs={2}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography fontSize={{ xs: "0.7rem", sm: "1rem" }}>
              {mp}
              {maxTargets !== 1 ? " × " + t("T") : ""}
            </Typography>
          </Grid>
          <Grid
            item
            xs={3}
            sm={4}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography fontSize={{ xs: "0.7rem", sm: "1rem" }}>
              {targetDesc}
            </Typography>
          </Grid>
          <Grid
            item
            xs={4}
            sm={3}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography fontSize={{ xs: "0.7rem", sm: "1rem" }}>
              {duration}
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
              <Tooltip title={t("Spell not shown in player sheet")}>
                <Icon>
                  <VisibilityOff style={{ color: "black" }} />
                </Icon>
              </Tooltip>
            )}
            <IconButton size="small" onClick={onEdit}>
              <Edit style={{ color:  iconColor }} />
            </IconButton>
          </Grid>
        )}
      </div>

      {/* Row 3 */}
      <Grid
        container
        justifyContent="flex-start"
        sx={{
          background: "transparent",
          padding: "3px 17px",
          marginBottom: "6px",
          borderBottom: `1px solid ${theme.secondary}`,
        }}
      >
        <Grid item xs={12}>
          <Typography component={"div"} sx={{ minHeight: "30px" }}>
            <StyledMarkdown allowedElements={["strong", "em"]} unwrapDisallowed>
              {description}
            </StyledMarkdown>
          </Typography>
        </Grid>
        {isOffensive && (
          <Grid item xs={12}>
            <Typography
              variant="body1"
              style={{
                marginTop: "1px",
                fontWeight: "bold",
              }}
            >
              {t("Magic Check") + ": "}
              <strong>
                <OpenBracket />
                {t(attributes[attr1].shortcaps)}
                {t(" + ")}
                {t(attributes[attr2].shortcaps)}
                <CloseBracket />
              </strong>
            </Typography>
          </Grid>
        )}
      </Grid>
    </>
  );
}

export default function SpellDefault(props) {
  const theme = useCustomTheme();
  return (
    <ThemeProvider theme={theme}>
      <ThemedSpellDefault {...props} />
    </ThemeProvider>
  );
}
