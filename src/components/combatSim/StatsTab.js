import {
  Box,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import HealthBar from "./HealthBar";

const StatsTab = ({
  selectedNPC,
  calcHP,
  calcMP,
  handleOpen,
  toggleStatusEffect,
}) => {
  return (
    <Box>
      {/* HP Section */}
      <Box sx={{ marginTop: 2, display: "flex", alignItems: "center" }}>
        <HealthBar
          label="HP"
          currentValue={selectedNPC?.combatStats?.currentHp || 0}
          maxValue={calcHP(selectedNPC)}
          startColor="#66bb6a"
          endColor="#388e3c"
          bgColor="#333333"
        />
        <Button
          variant="contained"
          color="error"
          onClick={() => handleOpen("HP", selectedNPC)}
          size="small"
          sx={{ ml: 2 }}
        >
          Modify
        </Button>
      </Box>

      {/* MP Section */}
      <Box sx={{ marginTop: 2, display: "flex", alignItems: "center" }}>
        <HealthBar
          label="MP"
          currentValue={selectedNPC?.combatStats?.currentMp || 0}
          maxValue={calcMP(selectedNPC)}
          startColor="#42a5f5"
          endColor="#0288d1"
          bgColor="#333333"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpen("MP", selectedNPC)}
          size="small"
          sx={{ ml: 2 }}
        >
          Modify
        </Button>
      </Box>

      {/* Status Effects */}
      <Box sx={{ marginTop: 3 }}>
        {[
          [
            { label: "Slow", color: "#1565c0" },
            { label: "Dazed", color: "#ab47bc" },
            { label: "Weak", color: "#ff7043" },
            { label: "Shaken", color: "#e8b923" },
          ],
          [
            { label: "Enraged", color: "#d32f2f" },
            { label: "Poisoned", color: "#4caf50" },
          ],
        ].map((row, rowIndex) => (
          <ToggleButtonGroup
            key={rowIndex}
            value={selectedNPC?.combatStats?.statusEffects || []}
            exclusive
            onChange={(event, newStatusEffects) =>
              toggleStatusEffect(selectedNPC, newStatusEffects)
            }
            sx={{ display: "flex", width: "100%", mt: rowIndex === 0 ? 0 : 1 }}
          >
            {row.map(({ label, color }) => (
              <ToggleButton
                key={label}
                value={label}
                sx={{
                  flex: "1 1 16%",
                  minWidth: "100px",
                  justifyContent: "center",
                  padding: "5px 0",
                  backgroundColor: "#ECECEC",
                  color: "black !important",
                  fontWeight: "bold",
                  letterSpacing: "1.5px",
                  fontSize: "1.2rem",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    backgroundColor: "#D3D3D3 !important",
                    color: "black !important",
                  },
                  "&.Mui-selected": {
                    backgroundColor: color,
                    color: "white !important",
                    "&:hover": {
                      backgroundColor: color + " !important",
                      color: "white !important",
                    },
                  },
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: "bold",
                    textAlign: "center",
                    color: "inherit",
                  }}
                >
                  {label}
                </Typography>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        ))}
      </Box>
    </Box>
  );
};

export default StatsTab;
