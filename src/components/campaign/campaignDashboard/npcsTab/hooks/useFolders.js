import { useState } from "react";
import {
  addNpcFolder,
  deleteNpcFolder,
  updateNpcFolder,
  updateNpcCampaignFolder,
  getNpcFoldersForCampaign,
} from "../../../../../utility/db";

export const useFolders = (campaignId, npcFolders, setNpcFolders, loadNpcs, showSnackbar) => {
  const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] = useState(false);
  const [newNpcFolderName, setNewNpcFolderName] = useState("");
  const [isDeleteFolderDialogOpen, setIsDeleteFolderDialogOpen] = useState(false);
  const [folderToDeleteConfirmation, setFolderToDeleteConfirmation] = useState(null);
  const [isRenameFolderDialogOpen, setIsRenameFolderDialogOpen] = useState(false);
  const [folderToRename, setFolderToRename] = useState(null);
  const [renamedFolderName, setRenamedFolderName] = useState("");

  const handleCreateFolder = async (parentId) => {
    try {
      await addNpcFolder({
        campaignId: campaignId,
        name: newNpcFolderName,
        parentId: parentId, // Use selected folder as parent if needed
      });
      // Refresh folders list
      const foldersList = await getNpcFoldersForCampaign(campaignId);
      setNpcFolders(foldersList);
      setIsNewFolderDialogOpen(false);
      setNewNpcFolderName("");
      showSnackbar("Folder created successfully", "success");
    } catch (error) {
      console.error("Error creating folder:", error);
      showSnackbar("Failed to create folder", "error");
    }
  };

  const handleMoveNpcToFolder = async (npcId, folderId) => {
    try {
      await updateNpcCampaignFolder(npcId, campaignId, folderId);
      showSnackbar("NPC moved to folder successfully", "success");
      await loadNpcs(); // Reload NPCs to reflect the change
    } catch (error) {
      console.error("Error moving NPC to folder:", error);
      showSnackbar("Failed to move NPC to folder", "error");
    }
  };

  const handleRenameFolder = (folderId) => {
    const findFolder = (folders, folderId) => {
      for (const folder of folders) {
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
    const folder = findFolder(npcFolders, folderId);
    if (folder) {
      setFolderToRename(folder);
      setRenamedFolderName(folder.name);
      setIsRenameFolderDialogOpen(true);
    } else {
      console.error("Folder not found for renaming:", folderId);
      showSnackbar("Could not find the folder to rename.", "error");
    }
  };

  const handleDeleteFolder = (folderId) => {
    const collectFolderIdsToDelete = (folders, targetId, idsToDelete = []) => {
      for (let folder of folders) {
        if (folder.id === targetId) {
          // Add this folder to delete list
          idsToDelete.push(folder.id);

          // Add all children recursively
          if (folder.children && folder.children.length > 0) {
            folder.children.forEach((child) => {
              idsToDelete.push(child.id);
              // Process nested children
              if (child.children && child.children.length > 0) {
                collectFolderIdsToDelete([child], child.id, idsToDelete);
              }
            });
          }
          return idsToDelete; // Found the target, return collected IDs
        }

        // Check children if current folder is not a match
        if (folder.children && folder.children.length > 0) {
          const foundInChildren = collectFolderIdsToDelete(
            folder.children,
            targetId,
            idsToDelete
          );
          // If found in children, return the result immediately
          if (foundInChildren.length > idsToDelete.length) {
            // Check if new IDs were added
            return foundInChildren;
          }
        }
      }
      // Return the current state of idsToDelete if target not found in this branch
      return idsToDelete;
    };

    const folderIdsToDelete = collectFolderIdsToDelete(npcFolders, folderId);
    if (folderIdsToDelete.length > 0) {
      setFolderToDeleteConfirmation(folderIdsToDelete);
      setIsDeleteFolderDialogOpen(true);
    } else {
      console.warn("No folders found to delete for ID:", folderId);
    }
  };

  const handleConfirmDelete = async () => {
    if (!folderToDeleteConfirmation) return;

    const folderIdsToDelete = Array.isArray(folderToDeleteConfirmation)
      ? folderToDeleteConfirmation
      : [folderToDeleteConfirmation];

    const originalFolders = JSON.parse(JSON.stringify(npcFolders)); // Deep copy for revert

    // Filter deleted folders
    const filterDeletedFolders = (folders) => {
      return folders.reduce((acc, folder) => {
        if (!folderIdsToDelete.includes(folder.id)) {
          if (folder.children && folder.children.length > 0) {
            folder.children = filterDeletedFolders(folder.children);
          }
          acc.push(folder);
        }
        return acc;
      }, []);
    };

    // Apply optimistic update
    setNpcFolders(filterDeletedFolders([...npcFolders]));

    try {
      // Delete all folders on the server
      for (const folderId of folderIdsToDelete) {
        await deleteNpcFolder(folderId, campaignId);
      }
      showSnackbar("Folder(s) deleted successfully", "success");
    } catch (error) {
      console.error("Failed to delete folder:", error);
      showSnackbar(`Failed to delete folder: ${error.message}`, "error");
      // Revert the optimistic update
      setNpcFolders(originalFolders);
    } finally {
      setIsDeleteFolderDialogOpen(false);
      setFolderToDeleteConfirmation(null);

      // Refresh folders from server to ensure sync
      try {
        const foldersList = await getNpcFoldersForCampaign(campaignId);
        setNpcFolders(foldersList);
        // Also reload NPCs in case some were moved out of deleted folders implicitly
        await loadNpcs();
      } catch (refreshError) {
        console.error("Failed to refresh folders/NPCs after delete:", refreshError);
        showSnackbar("Failed to refresh data after deletion.", "warning");
      }
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteFolderDialogOpen(false);
    setFolderToDeleteConfirmation(null);
  };

  const handleConfirmRenameFolder = async () => {
    if (!folderToRename || !renamedFolderName.trim()) return;

    try {
      await updateNpcFolder({
        id: folderToRename.id,
        campaignId: folderToRename.campaignId,
        name: renamedFolderName.trim(),
        parentId: folderToRename.parentId,
      });
      showSnackbar("Folder renamed successfully", "success");
      // Refresh folders list
      const foldersList = await getNpcFoldersForCampaign(campaignId);
      setNpcFolders(foldersList);
      setIsRenameFolderDialogOpen(false);
      setFolderToRename(null);
      setRenamedFolderName("");
    } catch (error) {
      console.error("Error renaming folder:", error);
      showSnackbar("Failed to rename folder", "error");
    }
  };

  return {
    // State
    isNewFolderDialogOpen,
    newNpcFolderName,
    isDeleteFolderDialogOpen,
    folderToDeleteConfirmation,
    isRenameFolderDialogOpen,
    folderToRename,
    renamedFolderName,
    // Actions
    handleCreateFolder,
    handleMoveNpcToFolder,
    handleRenameFolder,
    handleDeleteFolder,
    handleConfirmDelete,
    handleCancelDelete,
    handleConfirmRenameFolder,
    // Setters
    setIsNewFolderDialogOpen,
    setNewNpcFolderName,
    setIsDeleteFolderDialogOpen,
    setIsRenameFolderDialogOpen,
    setRenamedFolderName,
    setFolderToRename
  };
};