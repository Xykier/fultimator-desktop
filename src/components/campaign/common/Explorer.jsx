import React, { useState, useEffect } from "react";
import {
  Box,
  Drawer,
  useMediaQuery,
  Fab,
  Zoom,
  useTheme,
  Grid,
} from "@mui/material";
import {
  FolderOpen as FolderOpenIcon,
  Home as HomeIcon,
  People as PeopleIcon,
  ViewList as ViewListIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import FolderIcon from "@mui/icons-material/Folder";
import FolderBreadcrumbs from "./FolderBreadcrumbs";
import FolderSidebar from "./FolderSidebar";
import MoveFolderDialog from "./MoveFolderDialog";
import FolderHeader from "./FolderHeader";
import ContentToolbar from "./ContentToolbar";
import ContentList from "./ContentList";
import {
  useTranslate,
  replacePlaceholders,
} from "../../../translation/translate";

/**
 * Explorer component for managing folders and content items
 *
 * @param {Object} props
 * @param {Array} props.folders - Hierarchical folder structure
 * @param {string|null} props.selectedFolderId - ID of currently selected folder
 * @param {Function} props.setSelectedFolderId - Function to update selected folder
 * @param {boolean} props.showAllFolders - Whether to show all folders or only the current folder tree
 * @param {Function} props.setShowAllFolders - Function to toggle showing all folders
 * @param {string} props.viewMode - Current view mode (grid/list)
 * @param {Function} props.setViewMode - Function to update view mode
 * @param {Array} props.items - Content items to display in current folder
 * @param {boolean} props.emptyList - Whether the item list is empty
 * @param {Function} props.setIsNewFolderDialogOpen - Function to open the new folder dialog
 * @param {Function} props.moveItemToFolder - Function to move an item to a different folder
 * @param {Function} props.unlinkMultipleItems - Function to unlink multiple items
 * @param {Function} props.prepareRenameFolder - Function to prepare renaming a folder
 * @param {Function} props.prepareDeleteFolder - Function to prepare deleting a folder
 * @param {Function} props.handleUnlinkItem - Function to unlink a single item
 * @param {string} props.filterValue - Current filter value for filtering items
 * @param {React.Component} props.ItemCardComponent - Component to render an item in card view
 * @param {React.Component} props.ItemListComponent - Component to render an item in list view
 * @param {React.Component} props.EmptyListComponent - Component to render when no items exist
 * @param {Object} props.itemLabels - Labels for items in singular and plural forms
 * @param {string} props.itemLabels.singular - Singular form of item label (e.g., "character", "NPC", "location")
 * @param {string} props.itemLabels.plural - Plural form of item label (e.g., "characters", "NPCs", "locations")
 * @param {string} props.itemLabels.translationKey - Base translation key for item labels (e.g., "explorer_item_character")
 */
const Explorer = ({
  folders = [],
  selectedFolderId = null,
  setSelectedFolderId,
  showAllFolders = false,
  setShowAllFolders,
  viewMode = "grid",
  setViewMode,
  items = [],
  emptyList = false,
  setIsNewFolderDialogOpen,
  moveItemToFolder,
  unlinkMultipleItems,
  prepareRenameFolder,
  prepareDeleteFolder,
  handleUnlinkItem,
  filterValue = "",
  ItemCardComponent,
  ItemListComponent,
  EmptyListComponent,
  itemLabels = {
    singular: "item",
    plural: "items",
    translationKey: "explorer_item_generic",
  },
  headerCustomIcons = {
    root: <HomeIcon color="primary" sx={{ mr: 1.5 }} />,
    folder: <FolderOpenIcon color="primary" sx={{ mr: 1.5 }} />,
    allFolders: <PeopleIcon color="primary" sx={{ mr: 1.5 }} />,
  },
  breadcrumbsFolderIcons = {
    root: <HomeIcon fontSize="small" />,
    folder: <FolderIcon fontSize="small" />,
    allFolders: <ViewListIcon fontSize="small" />,
  },
  toolbarCustomIcons = {
    move: <FolderIcon />,
    unlink: <DeleteIcon />,
    clear: <CloseIcon fontSize="small" />,
  },
}) => {
  // Initialize the translation hook
  const { t } = useTranslate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // State management
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [prevFolderId, setPrevFolderId] = useState(selectedFolderId);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [moveFolderDialogOpen, setMoveFolderDialogOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState("");
  const [itemToMove, setItemToMove] = useState(null);

  /**
   * Clear selection when folder changes
   */
  useEffect(() => {
    if (prevFolderId !== selectedFolderId) {
      setSelectedItems([]);
      setSelectionMode(false);
      setPrevFolderId(selectedFolderId);
    }
  }, [selectedFolderId, prevFolderId]);

  /**
   * Automatically manage selection mode based on selected items count
   */
  useEffect(() => {
    if (selectedItems.length > 0 && !selectionMode) {
      setSelectionMode(true);
    } else if (selectedItems.length === 0 && selectionMode) {
      setSelectionMode(false);
    }
  }, [selectedItems, selectionMode]);

  /**
   * Find folder object by ID from hierarchical folder structure
   *
   * @param {Array} folderList - List of folders to search through
   * @param {string} folderId - ID of folder to find
   * @returns {Object|null} - Found folder or null
   */
  const findFolder = (folderList, folderId) => {
    if (!folderList || !Array.isArray(folderList)) {
      console.error(t("explorer_invalid_folders_data"), folderList);
      return null;
    }

    for (const folder of folderList) {
      if (folder.id === folderId) {
        return folder;
      }
      if (folder.children && folder.children.length > 0) {
        const found = findFolder(folder.children, folderId);
        if (found) {
          return found;
        }
      }
    }
    return null;
  };

  // Get current folder object
  const currentFolder = selectedFolderId
    ? findFolder(folders, selectedFolderId)
    : null;

  /**
   * Handle item selection toggle
   *
   * @param {string} itemId - ID of item to select/deselect
   * @param {boolean} isSelected - Whether item is selected
   */
  const handleSelectItem = (itemId, isSelected) => {
    if (isSelected) {
      setSelectedItems((prev) => [...prev, itemId]);
    } else {
      setSelectedItems((prev) => prev.filter((id) => id !== itemId));
    }
  };

  /**
   * Handle select all/deselect all toggle
   */
  const handleSelectAll = () => {
    if (selectedItems.length === items.length) {
      // Deselect all if all are selected
      setSelectedItems([]);
    } else {
      // Select all displayed items
      setSelectedItems(items.map((item) => item.id));
    }
  };

  /**
   * Clear all selections and exit selection mode
   */
  const handleClearSelection = () => {
    setSelectedItems([]);
    setSelectionMode(false);
  };

  /**
   * Open create folder dialog
   */
  const handleCreateFolder = () => {
    setIsNewFolderDialogOpen(true);
  };

  /**
   * Handle batch unlink operation for selected items
   */
  const handleBatchUnlink = () => {
    unlinkMultipleItems(selectedItems);
    setSelectedItems([]);
  };

  /**
   * Open move folder dialog
   */
  const handleMoveFolderOpen = () => {
    setMoveFolderDialogOpen(true);
  };

  /**
   * Close move folder dialog and reset selection
   */
  const handleMoveFolderClose = () => {
    setMoveFolderDialogOpen(false);
    setSelectedFolder("");
  };

  /**
   * Execute move operation for selected items or single item
   *
   * @param {string} folderId - Destination folder ID
   */
  const handleMoveToFolder = (folderId) => {
    if (itemToMove) {
      moveItemToFolder(itemToMove, folderId);
      setItemToMove(null);
    } else if (selectedItems.length > 0) {
      selectedItems.forEach((itemId) => {
        moveItemToFolder(itemId, folderId);
      });
      setSelectedItems([]);
    }
    setMoveFolderDialogOpen(false);
  };

  /**
   * Handle folder selection change in move dialog
   *
   * @param {Object} event - Change event
   */
  const handleFolderChange = (event) => {
    setSelectedFolder(event.target.value);
  };

  /**
   * Toggle mobile drawer open/closed
   */
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  /**
   * Open move dialog for a single item
   *
   * @param {string} itemId - ID of item to move
   */
  const handleOpenMoveDialog = (itemId) => {
    setItemToMove(itemId);
    setMoveFolderDialogOpen(true);
  };

  // Get dialog titles and content with proper translations and item labels
  const moveDialogTitle = replacePlaceholders(
    t(`${itemLabels.translationKey}_move_to_folder`),
    {
      count: selectedItems.length,
      itemLabel:
        selectedItems.length === 1
          ? t(`${itemLabels.translationKey}_singular`)
          : t(`${itemLabels.translationKey}_plural`),
    }
  );

  return (
    <>
      <Grid item xs={12}>
        <FolderBreadcrumbs
          folders={folders}
          selectedFolderId={selectedFolderId}
          setSelectedFolderId={setSelectedFolderId}
          showAllFolders={showAllFolders}
          setShowAllFolders={setShowAllFolders}
          customIcons={breadcrumbsFolderIcons}
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
                  customIcons={headerCustomIcons}
                  itemLabels={itemLabels}
                />

                {/* Selection Toolbar */}
                <ContentToolbar
                  selectedItems={selectedItems}
                  selectionMode={selectionMode}
                  onClearSelection={handleClearSelection}
                  onMoveToFolder={handleMoveFolderOpen}
                  onUnlink={handleBatchUnlink}
                  customIcons={toolbarCustomIcons}
                  itemLabels={itemLabels}
                />

                {/* Content List */}
                <ContentList
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
                  itemLabels={itemLabels}
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
                    : selectedItems.length > 0
                      ? items.find((item) => item.id === selectedItems[0])?.folderId
                      : null
                }
                title={moveDialogTitle}
                itemLabels={itemLabels}
              />
            </Box>
          </Box>
        </Box>
      </Grid>
    </>
  );
};

export default Explorer;
