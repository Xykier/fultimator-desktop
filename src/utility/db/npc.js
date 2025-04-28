import { dbPromise, NPC_STORE_NAME, NPC_CAMPAIGN_STORE_NAME } from "../db";

// Adds a new NPC to the database.
export const addNpc = async (npc) => {
  const db = await dbPromise;
  const npcId = await db.add(NPC_STORE_NAME, npc);
  return npcId;
};

// Retrieves all non simplified NPCs from the database.
export const getNpcs = async () => {
  const db = await dbPromise;  
  const npcs = await db.getAll(NPC_STORE_NAME);
  return npcs.filter(npc => !npc.isSimplified);
};

// Retrieves a specific NPC from the database by its ID, including campaign-specific data.
export const getNpc = async (id) => {
  const db = await dbPromise;
  const npc = await db.get(NPC_STORE_NAME, id);
  if (!npc) return null;

  // Fetch campaign-specific data
  const campaigns = await db.getAll(NPC_CAMPAIGN_STORE_NAME);
  const npcCampaigns = campaigns.filter((nc) => nc.npcId === id);

  return {
    ...npc,
    campaigns: npcCampaigns,
  };
};

// Deletes a specific NPC from the database by its ID, including all related campaign data.
export const deleteNpc = async (id) => {
  const db = await dbPromise;
  // Start a transaction to delete the NPC and all related campaign data
  const tx = db.transaction(
    [NPC_STORE_NAME, NPC_CAMPAIGN_STORE_NAME],
    "readwrite"
  );

  // Delete the NPC
  await tx.objectStore(NPC_STORE_NAME).delete(id);

  // Delete all campaign data for this NPC
  const campaignIndex = tx.objectStore(NPC_CAMPAIGN_STORE_NAME).index("npcId");
  let cursor = await campaignIndex.openCursor(id);
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }

  // Commit the transaction
  await tx.done;
};

// Updates an existing NPC in the database.
export const updateNpc = async (npc) => {
  const db = await dbPromise;
  await db.put(NPC_STORE_NAME, npc);
};

// Deletes all NPCs from the database.
export const deleteAllNpcs = async () => {
  const db = await dbPromise;
  const transaction = db.transaction(NPC_STORE_NAME, "readwrite");
  const store = transaction.objectStore(NPC_STORE_NAME);
  await store.clear();
  await transaction.done;
};

// Retrieves a list of all unique NPC tags from the database, sorted alphabetically.
export const getNpcTagList = async () => {
  const db = await dbPromise;
  const npcs = await db.getAll(NPC_STORE_NAME);

  const tagMap = new Map();

  npcs.forEach((npc) => {
    if (Array.isArray(npc.tags)) {
      npc.tags.forEach((tag) => {
        if (tag.name) {
          const tagName = tag.name.toUpperCase();
          tagMap.set(tagName, (tagMap.get(tagName) || 0) + 1);
        }
      });
    }
  });

  return Array.from(tagMap.entries())
    .map(([name, usageCount]) => ({ name, usageCount }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

// Adds a new campaign-specific NPC directly to the database with minimal attributes
export const addCampaignNpc = async (npc, campaignId) => {
  const db = await dbPromise;
  
  // Ensure required campaign-specific properties exist
  if (!campaignId) {
    throw new Error("campaignId is required for campaign-specific NPCs");
  }
  
  // Create a minimal NPC record
  const simplifiedNpc = {
    name: npc.name,
    description: npc.description,
    imgurl: npc.imgurl,
    isSimplified: true, // Flag to identify campaign-specific NPCs
    createdAt: new Date().toISOString(),
  };
  
  // Add the NPC to the main NPC store
  const npcId = await db.add(NPC_STORE_NAME, simplifiedNpc);
  
  // Create the campaign association with attitude
  const npcCampaign = {
    npcId: npcId,
    campaignId: campaignId,
    attitude: npc.attitude || "neutral",
    folderId: npc.folderId || null,
  };
  
  // Add the NPC-campaign association
  await db.put(NPC_CAMPAIGN_STORE_NAME, npcCampaign);
  
  return npcId;
};

// Retrieves all campaign-specific NPCs for a given campaign
export const getCampaignSpecificNpcs = async (campaignId) => {
  const db = await dbPromise;
  const allNpcs = await db.getAll(NPC_STORE_NAME);
  const campaignNpcs = [];
  
  for (const npc of allNpcs) {
    // Skip NPCs that don't have the simplified flag
    if (!npc.isSimplified) continue;
    
    // Check if this NPC is associated with the campaign
    const npcCampaign = await db.get(NPC_CAMPAIGN_STORE_NAME, [npc.id, campaignId]);
    if (npcCampaign) {
      campaignNpcs.push({
        ...npc,
        attitude: npcCampaign.attitude,
        folderId: npcCampaign.folderId,
      });
    }
  }
  
  return campaignNpcs;
};

// Updates a campaign-specific NPC
export const updateCampaignNpc = async (npc) => {
  const db = await dbPromise;
  
  // Get the existing NPC
  const existingNpc = await db.get(NPC_STORE_NAME, npc.id);
  if (!existingNpc || !existingNpc.isSimplified) {
    throw new Error("Cannot update: NPC not found or not a campaign-specific NPC");
  }
  
  // Update the base NPC information
  const updatedNpc = {
    ...existingNpc,
    name: npc.name,
    description: npc.description,
    imgurl: npc.imgurl,
    modifiedAt: new Date().toISOString(),
  };
  
  // Update the NPC record
  await db.put(NPC_STORE_NAME, updatedNpc);
  
  // Update the campaign-specific information if provided
  if (npc.campaignId && (npc.attitude !== undefined || npc.folderId !== undefined)) {
    const npcCampaign = await db.get(NPC_CAMPAIGN_STORE_NAME, [npc.id, npc.campaignId]);
    
    if (npcCampaign) {
      const updatedNpcCampaign = { 
        ...npcCampaign,
        attitude: npc.attitude !== undefined ? npc.attitude : npcCampaign.attitude,
        folderId: npc.folderId !== undefined ? npc.folderId : npcCampaign.folderId
      };
      
      await db.put(NPC_CAMPAIGN_STORE_NAME, updatedNpcCampaign);
    }
  }
};

// Deletes a campaign-specific NPC
export const deleteCampaignNpc = async (npcId) => {
  const db = await dbPromise;
  
  // Get the NPC to verify it's a campaign-specific one
  const npc = await db.get(NPC_STORE_NAME, npcId);
  if (!npc || !npc.isSimplified) {
    throw new Error("Cannot delete: NPC not found or not a campaign-specific NPC");
  }
  
  // Delete using the existing deleteNpc function which handles both the NPC and its campaign associations
  return deleteNpc(npcId);
};

// Get all NPCs for a campaign (both regular and campaign-specific)
export const getAllCampaignNpcs = async (campaignId) => {
  const db = await dbPromise;
  const allNpcs = await db.getAll(NPC_STORE_NAME);
  const result = [];
  
  for (const npc of allNpcs) {
    // Check if this NPC is associated with the campaign
    const npcCampaign = await db.get(NPC_CAMPAIGN_STORE_NAME, [npc.id, campaignId]);
    if (npcCampaign) {
      result.push({
        ...npc,
        attitude: npcCampaign.attitude,
        folderId: npcCampaign.folderId,
        isCampaignSpecific: !!npc.isSimplified // Convert to boolean for frontend
      });
    }
  }
  
  return result;
};