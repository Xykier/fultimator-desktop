import { dbPromise, NPC_FOLDER_STORE_NAME, NPC_CAMPAIGN_STORE_NAME } from "../db";

// Adds a new NPC folder to the database.
export const addNpcFolder = async (folder) => {
  const db = await dbPromise;
  // Ensure campaignId is present
  if (!folder.campaignId) {
    throw new Error("campaignId is required to create an NPC folder.");
  }
  const folderToAdd = {
    campaignId: folder.campaignId,
    name: folder.name,
    parentId: folder.parentId || null,
    createdAt: new Date().toISOString(),
  };
  return db.add(NPC_FOLDER_STORE_NAME, folderToAdd);
};

// Retrieves all NPC folders for a given campaign.
export const getNpcFoldersForCampaign = async (campaignId) => {
  const db = await dbPromise;
  const tx = db.transaction(NPC_FOLDER_STORE_NAME, "readonly");
  const index = tx.store.index("campaignId");
  const folders = await index.getAll(campaignId);

  // Function to build the folder hierarchy
  const buildFolderHierarchy = (parentId) => {
    return folders
      .filter((folder) => folder.parentId === parentId)
      .map((folder) => ({
        ...folder,
        children: buildFolderHierarchy(folder.id),
      }));
  };

  // Get the root folders (folders with no parent)
  const rootFolders = buildFolderHierarchy(null);

  return rootFolders;
};

// Updates an existing NPC folder in the database.
export const updateNpcFolder = async (folder) => {
  const db = await dbPromise;
  const folderToUpdate = {
    id: folder.id,
    campaignId: folder.campaignId,
    name: folder.name,
    parentId: folder.parentId,
    modifiedAt: new Date().toISOString(),
  };
  await db.put(NPC_FOLDER_STORE_NAME, folderToUpdate);
};

// Updates the attitude of an NPC towards a campaign.
export const updateNpcCampaignAttitude = async (npcId, campaignId, newAttitude) => {
  const db = await dbPromise;
  const npcCampaign = await db.get(NPC_CAMPAIGN_STORE_NAME, [npcId, campaignId]);

  if (npcCampaign) {
    const updatedNpcCampaign = { ...npcCampaign, attitude: newAttitude };
    await db.put(NPC_CAMPAIGN_STORE_NAME, updatedNpcCampaign);
  } else {
    console.error("NPC campaign data not found for npcId:", npcId, "and campaignId:", campaignId);
    throw new Error("NPC campaign data not found");
  }
};

// Deletes an NPC folder from the database and moves its NPCs to the root folder.
export const deleteNpcFolder = async (folderId, campaignId) => {
  try {
    const db = await dbPromise;
    const tx = db.transaction(
      [NPC_FOLDER_STORE_NAME, NPC_CAMPAIGN_STORE_NAME],
      "readwrite"
    );
    const folderStore = tx.objectStore(NPC_FOLDER_STORE_NAME);
    const npcCampaignStore = tx.objectStore(NPC_CAMPAIGN_STORE_NAME);
    const campaignIndex = npcCampaignStore.index("folderId");

    // Find NPCs in this folder and move them to root (folderId = null)
    let cursor = await campaignIndex.openCursor(folderId);
    while (cursor) {
      const npcCampaign = cursor.value;
      // Only update if the NPC is also associated with the current campaign
      if (npcCampaign.campaignId === campaignId) {
        const updatedNpcCampaign = { ...npcCampaign, folderId: null };
        if (updatedNpcCampaign.folderId === undefined) {
          updatedNpcCampaign.folderId = null;
        }
        await cursor.update(updatedNpcCampaign);
      }
      cursor = await cursor.continue();
    }

    // Delete the folder
    await folderStore.delete(folderId);

    await tx.done;
    console.log(`Deleted folder ${folderId} and moved its NPCs to root.`);
  } catch (error) {
    console.error("Error deleting NPC folder:", error);
    throw new Error("Failed to delete NPC folder: " + error.message);
  }
};

// Updates the folder of an NPC in a campaign.
export const updateNpcCampaignFolder = async (npcId, campaignId, folderId) => {
  const db = await dbPromise;
  const npcCampaign = await db.get(NPC_CAMPAIGN_STORE_NAME, [npcId, campaignId]);

  if (npcCampaign) {
    const updatedNpcCampaign = { ...npcCampaign, folderId: folderId === undefined ? null : folderId };
    await db.put(NPC_CAMPAIGN_STORE_NAME, updatedNpcCampaign);
  } else {
    console.error("NPC campaign data not found for npcId:", npcId, "and campaignId:", campaignId);
    throw new Error("NPC campaign data not found");
  }
};