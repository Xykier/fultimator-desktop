import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import { useTranslate } from "../../../translation/translate";
import { Close } from "@mui/icons-material";

const availableKeys = [
  {
    name: "Flame",
    type: "fire",
    status: "shaken",
    attribute: "Might",
    recovery: "Hit Points",
  },
  {
    name: "Frost",
    type: "ice",
    status: "weak",
    attribute: "Willpower",
    recovery: "Mind Points",
  },
  {
    name: "Iron",
    type: "physical",
    status: "slow",
    attribute: "Willpower",
    recovery: "Mind Points",
  },
  {
    name: "Radiance",
    type: "bolt",
    status: "shaken",
    attribute: "Dexterity",
    recovery: "Hit Points",
  },
  {
    name: "Shadow",
    type: "light",
    status: "dazed",
    attribute: "Insight",
    recovery: "Hit Points",
  },
  {
    name: "Stone",
    type: "dark",
    status: "weak",
    attribute: "Dexterity",
    recovery: "Mind Points",
  },
  {
    name: "Thunder",
    type: "earth",
    status: "dazed",
    attribute: "Might",
    recovery: "Hit Points",
  },
  {
    name: "Wind",
    type: "air",
    status: "slow",
    attribute: "Insight",
    recovery: "Mind Points",
  },
  { name: "Custom", type: "", status: "", attribute: "", recovery: "", customName: "" },
];

export default function SpellChanterKeysModal({
  open,
  onClose,
  onSave,
  onDelete,
  magichant,
}) {
  const { t } = useTranslate();
  const [currentKeys, setCurrentKeys] = useState(magichant?.keys || []);
  const [showInPlayerSheet, setShowInPlayerSheet] = useState(
    magichant ? !!magichant.showInPlayerSheet : true
  );

  useEffect(() => {
    if (magichant) {
      setShowInPlayerSheet(!!magichant.showInPlayerSheet);
    }
  }, [magichant]);

  const handleAddKey = () => {
    setCurrentKeys([
      ...currentKeys,
      { name: "Custom", type: "", status: "", attribute: "", recovery: "" , customName: "" },
    ]);
  };

  const handleKeyChange = (index, field, value) => {
    const updatedKeys = [...currentKeys];
  
    if (field === "name") {
      const selectedKey = availableKeys.find((key) => key.name === value);
      
      if (selectedKey) {
        updatedKeys[index] = {
          ...selectedKey,
          customName: selectedKey.name === "Custom" ? updatedKeys[index].customName : "",
        };
      }
    } else {
      updatedKeys[index][field] = value;
    }
  
    setCurrentKeys(updatedKeys);
  };

  const handleDeleteKey = (index) => {
    setCurrentKeys(currentKeys.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(magichant.index, {
      ...magichant,
      keys: currentKeys,
      showInPlayerSheet: showInPlayerSheet,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: "80%", maxWidth: "lg" } }}
    >
      <DialogTitle sx={{ fontWeight: "bold", fontSize: "1.5rem" }}>
        {t("Edit Learnt Magichant Keys")}
      </DialogTitle>
      <Button
        aria-label="close"
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <Close />
      </Button>
      <DialogContent>
        <Grid container spacing={2}>
          {currentKeys.map((key, index) => (
            <Grid
              item
              xs={12}
              key={index}
              container
              spacing={1}
              alignItems="center"
            >
              <Grid item xs={2}>
                <FormControl fullWidth>
                  <InputLabel>{t("Key")}</InputLabel>
                  <Select
                    value={key.name}
                    onChange={(e) =>
                      handleKeyChange(index, "name", e.target.value)
                    }
                  >
                    {availableKeys.map((option) => (
                      <MenuItem key={option.name} value={option.name}>
                        {option.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
                <>
                  <Grid item xs={2}>
                    <TextField
                      label={t("Name")}
                      value={key.name === "Custom" ? 
                        key.customName : key.name}
                      onChange={(e) =>
                        handleKeyChange(index, "customName", e.target.value)
                      }
                      disabled={key.name !== "Custom"}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <TextField
                      label={t("Type")}
                      value={key.type}
                      onChange={(e) =>
                        handleKeyChange(index, "type", e.target.value)
                      }
                      disabled={key.name !== "Custom"}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <TextField
                      label={t("Status Effect")}
                      value={key.status}
                      onChange={(e) =>
                        handleKeyChange(index, "status", e.target.value)
                      }
                      disabled={key.name !== "Custom"}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <TextField
                      label={t("Attribute")}
                      value={key.attribute}
                      onChange={(e) =>
                        handleKeyChange(index, "attribute", e.target.value)
                      }
                      disabled={key.name !== "Custom"}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <TextField
                      label={t("Recovery")}
                      value={key.recovery}
                      onChange={(e) =>
                        handleKeyChange(index, "recovery", e.target.value)
                      }
                      disabled={key.name !== "Custom"}
                      fullWidth
                    />
                  </Grid>
                </>
         
              <Grid item xs={1}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleDeleteKey(index)}
                >
                  {t("Delete")}
                </Button>
              </Grid>
            </Grid>
          ))}
        </Grid>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddKey}
          sx={{ mt: 2 }}
        >
          {t("Add Key")}
        </Button>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="secondary" onClick={handleSave}>
          {t("Save Changes")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
