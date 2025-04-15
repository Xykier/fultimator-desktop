import {
  CardMedia,
  Typography,
  Link,
  Box,
  Divider,
  Stack,
  Grid,
  Button,
  Paper,
  useMediaQuery,
  Tooltip,
  IconButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useState } from "react";
import { useTranslate } from "../translation/translate";
import adversary_designer from "./adversary_designer.webp";
import combat_simulator from "./combat_simulator.webp";
import items_rituals_projects from "./items_rituals_projects.webp";
import character_designer from "./character_designer.webp";
import powered_by_fu from "./powered_by_fu.png";
import PublicIcon from "@mui/icons-material/Public";
import FeedbackIcon from "@mui/icons-material/Feedback";
import DesktopMacIcon from "@mui/icons-material/DesktopMac";
import UpdateIcon from "@mui/icons-material/Update";
import { DiscordIcon } from "../components/icons";
import CopyrightIcon from "@mui/icons-material/Copyright";
import { useCustomTheme } from "../hooks/useCustomTheme";
import { useTheme } from "@mui/material/styles";
import EmailIcon from "@mui/icons-material/Email";

function Home() {
  const theme = useCustomTheme();
  const muiTheme = useTheme();
  const isDarkMode = theme.mode === "dark";
  const navigate = useNavigate();
  const [hover, setHover] = useState("");
  const { t } = useTranslate();
  const isSmallScreen = useMediaQuery(muiTheme.breakpoints.down("md"));

  // Function to call the electron IPC handler for checking updates
  const checkForUpdates = () => {
    if (window.electron) {
      window.electron.checkForUpdates();
    } else {
      console.log("Electron IPC not available");
    }
  };

  const mediaItems = [
    {
      image: character_designer,
      link: "/pc-gallery",
      hoverKey: "character_designer",
    },
    {
      image: adversary_designer,
      link: "/npc-gallery",
      hoverKey: "adversary_designer",
    },
    {
      image: combat_simulator,
      link: "/combat-sim",
      hoverKey: "combat_simulator",
    },
    {
      image: items_rituals_projects,
      link: "/generate",
      hoverKey: "items_rituals_projects",
    },
  ];

  return (
    <Layout>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: "1em",
          margin: "1em",
        }}
      >
        {mediaItems.map((item, index) => (
          <CardMedia
            key={index}
            component="img"
            image={item.image}
            alt=""
            sx={{
              objectFit: "contain",
              width: 360,
              cursor: "pointer",
              transform: hover === item.hoverKey ? "scale(1.05)" : "none",
              transition: "transform 0.3s",
            }}
            onMouseEnter={() => {
              setHover(item.hoverKey);
            }}
            onMouseLeave={() => {
              setHover("");
            }}
            onClick={() => {
              navigate(item.link);
            }}
          />
        ))}
      </div>

      {/* Placeholder Button for campaings section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "2em",
        }}
      >
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => {
            navigate("/campaigns");
          }}
        >
          {t("campaigns")}
        </Button>
      </Box>

      <Box
        sx={{
          mt: 5,
          mb: 5,
          padding: "2em",
          backgroundColor: isDarkMode ? `#252525` : "#f5f5f5",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                height: "100%",
                borderRadius: "8px",
                backgroundColor: isDarkMode ? "#333333" : "#ffffff",
                transition: "transform 0.3s",
                "&:hover": {
                  transform: "translateY(-5px)",
                },
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  mb: 2,
                  fontWeight: "bold",
                  color: isDarkMode ? "#e0e0e0" : "#333333",
                }}
              >
                <Box
                  component="span"
                  sx={{
                    verticalAlign: "middle",
                    mr: 1,
                    display: "inline-flex",
                  }}
                >
                  <DiscordIcon
                    size={24}
                    color={isDarkMode ? "#7289da" : "#7289da"}
                  />
                </Box>
                {t("Join the Fultimator Community!")}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {t("We would love to have you on board!")}
              </Typography>
              <Button
                variant="contained"
                href="https://discord.gg/9yYc6R93Cd"
                target="_blank"
                rel="noreferrer"
                sx={{
                  backgroundColor: "#7289da",
                  "&:hover": { backgroundColor: "#5f73bc" },
                  fontWeight: "bold",
                }}
              >
                {t("Dive into the Discord Hub!")}
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                height: "100%",
                borderRadius: "8px",
                backgroundColor: isDarkMode ? "#333333" : "#ffffff",
                transition: "transform 0.3s",
                "&:hover": {
                  transform: "translateY(-5px)",
                },
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  mb: 2,
                  fontWeight: "bold",
                  color: isDarkMode ? "#e0e0e0" : "#333333",
                }}
              >
                <UpdateIcon
                  sx={{
                    verticalAlign: "middle",
                    mr: 1,
                    color: isDarkMode ? theme.secondary : theme.primary,
                  }}
                />
                {t("check_for_updates")}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {t("check_for_updates_description")}
              </Typography>
              <Button
                variant="contained"
                onClick={checkForUpdates}
                startIcon={<DesktopMacIcon />}
                color="primary"
              >
                {t("check_for_updates")}
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                height: "100%",
                borderRadius: "8px",
                backgroundColor: isDarkMode ? "#333333" : "#ffffff",
                transition: "transform 0.3s",
                "&:hover": {
                  transform: "translateY(-5px)",
                },
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  mb: 2,
                  fontWeight: "bold",
                  color: isDarkMode ? "#e0e0e0" : "#333333",
                }}
              >
                <PublicIcon
                  sx={{
                    verticalAlign: "middle",
                    mr: 1,
                    color: isDarkMode ? "#81c784" : "#388e3c",
                  }}
                />
                {t("extra_resources")}
              </Typography>
              <Stack spacing={2}>
                <Typography variant="body1">
                  {t("contact_runty")}
                  <Tooltip title="Email contactrunty@iCloud.com" arrow>
                    <IconButton
                      component="a"
                      href="mailto:contactrunty@iCloud.com"
                      sx={{
                        color: isDarkMode ? "#81c784" : "#388e3c",
                        ml: 1,
                      }}
                      size="small"
                    >
                      <EmailIcon />
                    </IconButton>
                  </Tooltip>
                </Typography>
                <Typography variant="body1">
                  {t("Monster Icons are taken from:")}
                  <Button
                    variant="text"
                    href="http://www.akashics.moe/"
                    target="_blank"
                    rel="noreferrer"
                    sx={{
                      color: isDarkMode ? "#81c784" : "#388e3c",
                      fontWeight: "bold",
                      ml: 1,
                      p: 0,
                      minWidth: "auto",
                    }}
                  >
                    akashics.moe
                  </Button>
                </Typography>
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                height: "100%",
                borderRadius: "8px",
                backgroundColor: isDarkMode ? "#333333" : "#ffffff",
                transition: "transform 0.3s",
                "&:hover": {
                  transform: "translateY(-5px)",
                },
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  mb: 2,
                  fontWeight: "bold",
                  color: isDarkMode ? "#e0e0e0" : "#333333",
                }}
              >
                <FeedbackIcon
                  sx={{
                    verticalAlign: "middle",
                    mr: 1,
                    color: isDarkMode ? "#ffb74d" : "#f57c00",
                  }}
                />
                {t("Contact Us")}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {t("feedback_description")}
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Button
                  variant="outlined"
                  href="mailto:fultimator@gmail.com"
                  sx={{
                    borderColor: isDarkMode ? "#ffb74d" : "#f57c00",
                    color: isDarkMode ? "#ffb74d" : "#f57c00",
                    "&:hover": {
                      borderColor: isDarkMode ? "#ffca28" : "#ffa726",
                      backgroundColor: "rgba(255, 199, 40, 0.1)",
                    },
                    fontWeight: "bold",
                  }}
                >
                  fultimator@gmail.com
                </Button>
                <Button
                  variant="outlined"
                  href="https://forms.gle/3P7Bq1CtZrnFwQsm8"
                  target="_blank"
                  rel="noreferrer"
                  sx={{
                    borderColor: isDarkMode ? "#ffb74d" : "#f57c00",
                    color: isDarkMode ? "#ffb74d" : "#f57c00",
                    "&:hover": {
                      borderColor: isDarkMode ? "#ffca28" : "#ffa726",
                      backgroundColor: "rgba(255, 199, 40, 0.1)",
                    },
                    fontWeight: "bold",
                  }}
                >
                  {t("google_form")}
                </Button>
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ marginBottom: 3 }} />
            <Box
              sx={{
                display: "flex",
                flexDirection: isSmallScreen ? "column" : "row",
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  mr: isSmallScreen ? 0 : 3,
                  mb: isSmallScreen ? 3 : 0,
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    mb: 2,
                    fontWeight: "bold",
                    color: isDarkMode ? "#e0e0e0" : "#333333",
                  }}
                >
                  <CopyrightIcon
                    sx={{
                      verticalAlign: "middle",
                      mr: 1,
                      color: isDarkMode ? "#bbdefb" : "#1976d2",
                    }}
                  />
                  {t("Copyright Notice")}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ mb: 1, color: isDarkMode ? "#e0e0e0" : "#555555" }}
                >
                  {"Fultimator is an independent production by"}{" "}
                  <Link
                    href="https://github.com/fultimator"
                    target="_blank"
                    rel="noreferrer"
                    underline="hover"
                    sx={{
                      color: isDarkMode ? theme.secondary : theme.primary,
                      fontWeight: "bold",
                    }}
                  >
                    {t("Fultimator Dev Team")}
                  </Link>
                  {" and is not affiliated with Need Games or Rooster Games."}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ mb: 1, color: isDarkMode ? "#e0e0e0" : "#555555" }}
                >
                  {"It is published under the"}{" "}
                  <Link
                    href="https://need.games/wp-content/uploads/2024/06/Fabula-Ultima-Third-Party-Tabletop-License-1.0.pdf"
                    target="_blank"
                    rel="noreferrer"
                    underline="hover"
                    sx={{
                      color: isDarkMode ? theme.secondary : theme.primary,
                      fontWeight: "bold",
                    }}
                  >
                    {"Fabula Ultima Third Party Tabletop License 1.0"}
                  </Link>
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: isDarkMode ? "#e0e0e0" : "#555555" }}
                >
                  {
                    "Fabula Ultima is a roleplaying game created by Emanuele Galletto and published by Need Games."
                  }
                  <br />
                  {"Fabula Ultima is © Need Games and Rooster Games."}
                </Typography>
              </Box>

              {/* Powered by FU image */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: isSmallScreen ? "center" : "flex-end",
                  alignItems: "center",
                  mt: isSmallScreen ? 2 : 0,
                  transition: "transform 0.3s",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    cursor: "pointer",
                  },
                }}
              >
                <img
                  src={powered_by_fu}
                  alt="Powered by Fabula Ultima"
                  onClick={() =>
                    window.open("https://need.games/fabula-ultima/", "_blank")
                  }
                  style={{
                    maxWidth: "200px",
                    height: "auto",
                  }}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
}

export default Home;
