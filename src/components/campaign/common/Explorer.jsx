import React, { useState, useEffect } from "react";
import {
  Box,
  Drawer,
  useMediaQuery,
  Fab,
  Zoom,
  useTheme,
  Grid,
  Typography,
  Toolbar,
  Button,
  Fade,
  Tooltip,
  IconButton,
  Stack,
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import FolderBreadcrumbs from "./FolderBreadcrumbs";
import FolderSidebar from "./FolderSidebar";
import MoveFolderDialog from "./MoveFolderDialog";
import FolderHeader from "./FolderHeader";

const Explorer = ({
  folders,
  selectedFolderId,
  setSelectedFolderId,
  showAllFolders,
  setShowAllFolders,
  viewMode,
  setViewMode,
  items,
  emptyList,
  setIsNewFolderDialogOpen,
  moveItemToFolder,
  unlinkMultipleItems,
  prepareRenameFolder,
  prepareDeleteFolder,
  handleUnlinkItem,
  filterValue,
  ItemCardComponent,
  ItemListComponent,
  EmptyListComponent
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Track previous folder ID to detect changes
  const [prevFolderId, setPrevFolderId] = useState(selectedFolderId);

  // Add selection state
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [moveFolderDialogOpen, setMoveFolderDialogOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState("");
  const [itemToMove, setItemToMove] = useState(null);

  // Clear selection when folder changes
  useEffect(() => {
    if (prevFolderId !== selectedFolderId) {
      setSelectedItems([]);
      setSelectionMode(false);
      setPrevFolderId(selectedFolderId);
    }
  }, [selectedFolderId, prevFolderId]);

  // Automatically enable selection mode when there are selected NPCs
  useEffect(() => {
    if (selectedItems.length > 0 && !selectionMode) {
      setSelectionMode(true);
    } else if (selectedItems.length === 0 && selectionMode) {
      setSelectionMode(false);
    }
  }, [selectedItems, selectionMode]);

  // Find the selected folder object if a folder is selected
  const findFolder = (folders, selectedFolderId) => {
    if (!folders || !Array.isArray(folders)) {
      console.error("Invalid folders data:", folders);
      return null;
    }

    for (const folder of folders) {
      if (folder.id === selectedFolderId) {
        return folder;
      }
      if (folder.children && folder.children.length > 0) {
        const found = findFolder(folder.children, selectedFolderId);
        if (found) {
          return found;
        }
      }
    }
    return null;
  };

  const currentFolder = selectedFolderId
    ? findFolder(folders, selectedFolderId)
    : null;

  // Selection handlers
  const handleSelectItem = (itemId, isSelected) => {
    if (isSelected) {
      setSelectedItems((prev) => [...prev, itemId]);
    } else {
      setSelectedItems((prev) => prev.filter((id) => id !== itemId));
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.length === items.length) {
      // Deselect all if all are selected
      setSelectedItems([]);
    } else {
      // Select all displayed NPCs
      setSelectedItems(items.map((npc) => npc.id));
    }
  };

  const handleClearSelection = () => {
    setSelectedItems([]);
    setSelectionMode(false);
  };

  const handleCreateFolder = (parentId) => {
    setIsNewFolderDialogOpen(true);
    // You might need to set the parent folder ID in your store
    console.log("handleCreateFolder", parentId);
  };

  // Batch actions for selected NPCs
  const handleBatchUnlink = () => {
    unlinkMultipleItems(selectedItems);
    setSelectedItems([]);
  };

  const handleMoveFolderOpen = () => {
    setMoveFolderDialogOpen(true);
  };

  const handleMoveFolderClose = () => {
    setMoveFolderDialogOpen(false);
    setSelectedFolder("");
  };

  const handleMoveToFolder = (folderId) => {
    if (itemToMove) {
      moveItemToFolder(itemToMove, folderId);
    } else if (selectedItems.length > 0) {
      selectedItems.forEach((itemId) => {
        moveItemToFolder(itemId, folderId);
      });
      setSelectedItems([]);
    }
  };

  const handleFolderChange = (event) => {
    setSelectedFolder(event.target.value);
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleOpenMoveDialog = (npcId) => {
    setItemToMove(npcId);
    setMoveFolderDialogOpen(true);
  };

  return (
    <>
      <Grid item xs={12}>
        <FolderBreadcrumbs
          folders={folders}
          selectedFolderId={selectedFolderId}
          setSelectedFolderId={setSelectedFolderId}
          showAllFolders={showAllFolders}
          setShowAllFolders={setShowAllFolders}
        />
      </Grid>

      <Grid item xs={12}>
        <Box
          sx={{
            display: "flex",
            height: "100%",
            position: "relative",
            width: "100%",
            marginBottom: 1,
          }}
        >
          {/* Folder sidebar - permanent on desktop, drawer on mobile */}
          {isMobile ? (
            <>
              <Drawer
                variant="temporary"
                open={drawerOpen}
                onClose={toggleDrawer}
                ModalProps={{ keepMounted: true }}
                sx={{
                  "& .MuiDrawer-paper": { width: 280, boxSizing: "border-box" },
                }}
              >
                <FolderSidebar
                  folders={folders}
                  selectedFolderId={selectedFolderId}
                  setSelectedFolderId={setSelectedFolderId}
                  showAllFolders={showAllFolders}
                  setShowAllFolders={setShowAllFolders}
                />
              </Drawer>

              <Zoom in={!drawerOpen}>
                <Fab
                  color="primary"
                  size="small"
                  onClick={toggleDrawer}
                  sx={{ position: "absolute", bottom: 16, left: 16, zIndex: 1 }}
                >
                  <FolderIcon />
                </Fab>
              </Zoom>
            </>
          ) : (
            <Box sx={{ width: 240, flexShrink: 0, mr: 2 }}>
              <FolderSidebar
                folders={folders}
                selectedFolderId={selectedFolderId}
                setSelectedFolderId={setSelectedFolderId}
                showAllFolders={showAllFolders}
                setShowAllFolders={setShowAllFolders}
              />
            </Box>
          )}

          {/* Main content */}
          <Box
            sx={{
              flexGrow: 1,
              width: isMobile ? "100%" : "calc(100% - 260px)",
              overflow: "hidden",
            }}
          >
            <Box sx={{ display: "flex", height: "100%", width: "100%" }}>
              {/* Main Content */}
              <Box
                sx={{
                  flex: 1,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Folder Header with breadcrumbs and actions */}
                <FolderHeader
                  selectedFolder={currentFolder}
                  onRenameFolder={prepareRenameFolder}
                  onDeleteFolder={prepareDeleteFolder}
                  onCreateFolder={handleCreateFolder}
                  viewMode={viewMode}
                  onChangeViewMode={setViewMode}
                  onSelectAll={handleSelectAll}
                  showAllFolders={showAllFolders}
                />

                {/* Selection Toolbar */}
                <ContentToolbar
                  selectedItems={selectedItems}
                  selectionMode={selectionMode}
                  onClearSelection={handleClearSelection}
                  onMoveToFolder={handleMoveFolderOpen}
                  onUnlink={handleBatchUnlink}
                />

                {/* NPCs Content */}
                <ListContent
                  items={items}
                  viewMode={viewMode}
                  selectedItems={selectedItems}
                  selectionMode={selectionMode}
                  handleSelectItem={handleSelectItem}
                  handleUnlinkItem={handleUnlinkItem}
                  handleOpenMoveDialog={handleOpenMoveDialog}
                  folders={folders}
                  emptyList={emptyList}
                  currentFolder={currentFolder}
                  filterValue={filterValue}
                  ItemCardComponent={ItemCardComponent}
                  ItemListComponent={ItemListComponent}
                  EmptyListComponent={EmptyListComponent}
                />
              </Box>

              {/* Move Folder Dialog */}
              <MoveFolderDialog
                open={moveFolderDialogOpen}
                onClose={handleMoveFolderClose}
                selectedFolder={selectedFolder}
                folders={folders}
                handleFolderChange={handleFolderChange}
                handleMoveToFolder={handleMoveToFolder}
                currentFolderId={
                  itemToMove
                    ? items.find((item) => item.id === itemToMove)?.folderId
                    : null
                }
                title={`Move ${selectedItems.length} items to folder`}
              />
            </Box>
          </Box>
        </Box>
      </Grid>
    </>
  );
};

const ListContent = ({
  items,
  viewMode,
  selectedItems,
  selectionMode,
  handleSelectItem,
  handleUnlinkItem,
  handleOpenMoveDialog,
  folders,
  currentFolder,
  filterValue,
  ItemCardComponent,
  ItemListComponent,
  EmptyListComponent
}) => {
  return (
    <Box sx={{ flex: 1, overflowY: "auto", paddingTop: 1 }}>
      {items.length > 0 ? (
        viewMode === "grid" ? (
          <Grid container spacing={2}>
            {items.map((item) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                <ItemCardComponent
                  item={item}
                  onUnlink={handleUnlinkItem}
                  folders={folders}
                  onSelect={handleSelectItem}
                  isSelected={selectedItems.includes(item.id)}
                  selectionMode={selectionMode}
                  onMove={handleOpenMoveDialog}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Stack spacing={1}>
            {items.map((item) => (
              <ItemListComponent
                key={item.id}
                item={item}
                onUnlink={handleUnlinkItem}
                folders={folders}
                onSelect={handleSelectItem}
                isSelected={selectedItems.includes(item.id)}
                selectionMode={selectionMode}
                onMove={handleOpenMoveDialog}
              />
            ))}
          </Stack>
        )
      ) : (
        // Empty state specific to the selected filter
        <EmptyListComponent
          currentFolder={currentFolder}
          filterValue={filterValue}
        />
      )}
    </Box>
  );
};

const ContentToolbar = ({
  selectedItems,
  selectionMode,
  onClearSelection,
  onMoveToFolder,
  onUnlink,
}) => {
  return (
    <Fade in={selectionMode}>
      <Toolbar
        variant="dense"
        sx={{
          bgcolor: "primary.main",
          color: "primary.contrastText",
          borderRadius: 2,
          mb: 2,
          display: selectionMode ? "flex" : "none",
          justifyContent: "space-between",
          flexWrap: "wrap",
          p: { xs: 1, sm: 1.5 },
          gap: 1,
        }}
      >
        {/* Selected Count */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="subtitle1">
            {selectedItems.length} selected
          </Typography>          
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          <Button
            size="small"
            startIcon={<FolderIcon />}
            variant="outlined"
            color="inherit"
            onClick={onMoveToFolder}
          >
            Move to Folder
          </Button>
          <Button
            size="small"
            startIcon={<DeleteIcon />}
            variant="outlined"
            color="inherit"
            onClick={onUnlink}
          >
            Unlink Selected
          </Button>
          <Tooltip title="Clear Selection">
            <IconButton size="small" onClick={onClearSelection} color="inherit">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </Fade>
  );
};


export default Explorer;