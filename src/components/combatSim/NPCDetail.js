import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Select,
  MenuItem,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Close,
  Description,
  Favorite,
  Casino,
  Edit,
  Download,
} from "@mui/icons-material";
import NpcPretty from "../npc/Pretty";
import StatsTab from "./StatsTab";
import NotesTab from "./NotesTab";
import AttributeSection from "./AttributeSection";

const NPCDetail = ({
  selectedNPC,
  setSelectedNPC,
  tabIndex,
  setTabIndex,
  selectedStudy,
  handleStudyChange,
  downloadImage,
  calcHP,
  calcMP,
  handleOpen,
  toggleStatusEffect,
  selectedNPCs,
  setSelectedNPCs,
  calcAttr,
  handleDecreaseUltima,
  handleIncreaseUltima,
  isMobile,
}) => {
  if (!selectedNPC) return null;

  const handleTabChange = (_, newIndex) => setTabIndex(newIndex);

  const renderTabs = (
    <Tabs
      value={tabIndex}
      onChange={handleTabChange}
      variant="fullWidth"
      sx={{ minHeight: 40 }}
    >
      <Tab
        iconPosition="start"
        icon={<Description fontSize="small" />}
        label={!isMobile && "Sheet"}
        sx={{ minHeight: 40, padding: "4px 8px" }}
      />
      <Tab
        iconPosition="start"
        icon={<Favorite fontSize="small" />}
        label={!isMobile && "Stats"}
        sx={{ minHeight: 40, padding: "4px 8px" }}
      />
      <Tab
        iconPosition="start"
        icon={<Casino fontSize="small" />}
        label={!isMobile && "Rolls"}
        sx={{ minHeight: 40, padding: "4px 8px" }}
      />
      <Tab
        iconPosition="start"
        icon={<Edit fontSize="small" />}
        label={!isMobile && "Notes"}
        sx={{ minHeight: 40, padding: "4px 8px" }}
      />
    </Tabs>
  );

  const content = (
    <>
      {!isMobile && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #ccc",
            paddingBottom: 1,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              flexShrink: 0,
              letterSpacing: 1,
              fontWeight: "bold",
              textTransform: "uppercase",
            }}
          >
            {selectedNPC.name}
          </Typography>
          <IconButton
            size="small"
            sx={{ padding: 0 }}
            onClick={() => {
              setSelectedNPC(null);
              setTabIndex(0);
            }}
          >
            <Close />
          </IconButton>
        </Box>
      )}

      {!isMobile && renderTabs}

      <Box sx={{ flexGrow: 1, overflowY: "auto", paddingTop: 1 }}>
        {tabIndex === 0 && (
          <NpcPretty
            npc={selectedNPC}
            npcImage={selectedNPC.imgurl}
            collapse={true}
            study={selectedStudy}
          />
        )}
        {tabIndex === 1 && (
          <StatsTab
            selectedNPC={selectedNPC}
            calcHP={calcHP}
            calcMP={calcMP}
            handleOpen={handleOpen}
            toggleStatusEffect={toggleStatusEffect}
            handleDecreaseUltima={handleDecreaseUltima}
            handleIncreaseUltima={handleIncreaseUltima}
            isMobile={isMobile}
          />
        )}
        {tabIndex === 2 && (
          <Typography>Rolls Section still in development</Typography>
        )}
        {tabIndex === 3 && (
          <NotesTab
            selectedNPC={selectedNPC}
            selectedNPCs={selectedNPCs}
            setSelectedNPCs={setSelectedNPCs}
          />
        )}
      </Box>

      {tabIndex === 0 && (
        <Box
          sx={{
            borderTop: "1px solid #ccc",
            paddingTop: 1,
            display: "flex",
            justifyContent: "center",
            marginBottom: 1,
          }}
        >
          <Select
            value={selectedStudy}
            onChange={handleStudyChange}
            size="small"
          >
            <MenuItem value={0}>Study</MenuItem>
            <MenuItem value={1}>7+</MenuItem>
            <MenuItem value={2}>10+</MenuItem>
            <MenuItem value={3}>13+</MenuItem>
          </Select>
          <Tooltip title="Download Sheet" placement="bottom">
            <Button
              color="primary"
              aria-label="download"
              onClick={downloadImage}
            >
              <Download />
            </Button>
          </Tooltip>
        </Box>
      )}

      {!isMobile && (
        <AttributeSection selectedNPC={selectedNPC} calcAttr={calcAttr} />
      )}
    </>
  );

  return isMobile ? (
    <Dialog
      open={!!selectedNPC}
      onClose={() => setSelectedNPC(null)}
      fullScreen
    >
      <DialogTitle
        variant="h4"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          letterSpacing: 1,
          fontWeight: "bold",
          textTransform: "uppercase",
        }}
      >
        {selectedNPC.name}
        <IconButton onClick={() => setSelectedNPC(null)}>
          <Close />
        </IconButton>
      </DialogTitle>
      {renderTabs}
      <DialogContent dividers>{content}</DialogContent>
      <DialogActions sx={{ width: "100%", justifyContent: "center", padding: 0 }}>
        <AttributeSection selectedNPC={selectedNPC} calcAttr={calcAttr} />
      </DialogActions>
    </Dialog>
  ) : (
    <Box
      sx={{
        width: "30%",
        bgcolor: "#fff",
        padding: 2,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {content}
    </Box>
  );
};

export default NPCDetail;
