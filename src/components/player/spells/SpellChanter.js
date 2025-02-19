import React from "react";
import {
  Typography,
  IconButton,
  Grid,
  ThemeProvider,
  Tooltip,
  Icon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
} from "@mui/material";
import { Edit, VisibilityOff, ExpandMore, Info } from "@mui/icons-material";
import { useTranslate } from "../../../translation/translate";
import ReactMarkdown from "react-markdown";
import { useCustomTheme } from "../../../hooks/useCustomTheme";

function ThemedSpellChanter({ magichant, onEditKeys, isEditMode }) {
  const { t } = useTranslate();
  const theme = useCustomTheme();
  const isDarkMode = theme.mode === "dark";
  const iconColor = isDarkMode ? "#ffffff" : "#000000";
  const gradientColor = isDarkMode ? "#1f1f1f" : "#fff";

  const showInPlayerSheet =
    magichant.showInPlayerSheet || magichant.showInPlayerSheet === undefined;

  const inlineStyles = {
    margin: 0,
    padding: 0,
  };

  const components = {
    p: ({ node, ...props }) => <p style={inlineStyles} {...props} />,
  };

  return (
    <>
      <Accordion sx={{ marginY: 1 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Icon sx={{ color: theme.primary, marginRight: 1 }}>
            <Info />
          </Icon>
          <Typography variant="h4">{t("Magichant Details")}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ReactMarkdown>{t("test test")}</ReactMarkdown>
          <ReactMarkdown>{t("asd asd")}</ReactMarkdown>
        </AccordionDetails>
      </Accordion>
      {/* Row 1 */}
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
            xs={3}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "left",
              minHeight: "40px",
            }}
          >
            <Typography
              variant="h3"
              style={{ flexGrow: 1, marginRight: "5px" }}
              sx={{
                fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
              }}
            >
              {t("magichant_key")}
            </Typography>
          </Grid>
          <Grid
            item
            xs={2}
            sm={3}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
              }}
            >
              {t("magichant_type")}
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
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
              }}
            >
              {t("magichant_status_effect")}
            </Typography>
          </Grid>
          <Grid
            item
            xs={3}
            sm={2}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
              }}
            >
              {t("magichant_attribute")}
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
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
              }}
            >
              {t("magichant_recovery")}
            </Typography>
          </Grid>
        </Grid>
      </div>

      {/* Row 3 */}
      {magichant.keys.length === 0 ? (
        <Typography
          sx={{
            padding: "3px 17px",
            textAlign: "center",
            color: theme.primary,
            borderBottom: `1px solid ${theme.secondary}`,
            fontStyle: "italic",
          }}
        >
          {t("magichant_empty_keys")}
        </Typography>
      ) : (
        magichant.keys.map((chantKey, i) => (
          <Grid
            container
            justifyContent="flex-start"
            sx={{
              background: "transparent",
              padding: "3px 17px",
              marginBottom: "6px",
              borderBottom: `1px solid ${theme.secondary}`,
            }}
            key={i}
          >
            <Grid container style={{ flexGrow: 1 }}>
              <Grid
                item
                xs={3}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "left",
                }}
              >
                <Typography
                  fontWeight="bold"
                  style={{ flexGrow: 1, marginRight: "5px" }}
                  sx={{
                    fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
                  }}
                >
                  {chantKey.name === "magichant_custom_name"
                    ? chantKey.customName
                    : t(chantKey.name)}
                </Typography>
              </Grid>
              <Grid
                item
                xs={2}
                sm={3}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ReactMarkdown components={components}>
                  {chantKey.name === "magichant_custom_name"
                    ? chantKey.type
                    : t(chantKey.type)}
                </ReactMarkdown>
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
                <ReactMarkdown components={components}>
                  {chantKey.name === "magichant_custom_name"
                    ? chantKey.status
                    : t(chantKey.status)}
                </ReactMarkdown>
              </Grid>
              <Grid
                item
                xs={3}
                sm={2}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ReactMarkdown components={components}>
                  {chantKey.name === "magichant_custom_name"
                    ? chantKey.attribute
                    : t(chantKey.attribute)}
                </ReactMarkdown>
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
                <ReactMarkdown components={components}>
                  { chantKey.name === "magichant_custom_name"
                   ? chantKey.recovery
                    : t(
                  chantKey.recovery)}
                </ReactMarkdown>
              </Grid>
            </Grid>
          </Grid>
        ))
      )}
      <Button onClick={onEditKeys} variant="outlined" sx={{ marginTop: 2 }}>
        {t("magichant_edit_keys_button")}
      </Button>
    </>
  );
}

export default function SpellChanter(props) {
  const theme = useCustomTheme();
  return (
    <ThemeProvider theme={theme}>
      <ThemedSpellChanter {...props} />
    </ThemeProvider>
  );
}
