import { dbPromise, NPC_STORE_NAME, NPC_CAMPAIGN_STORE_NAME } from "../db";

// Adds a new NPC to the database.
export const addNpc = async (npc) => {
  const db = await dbPromise;
  const npcId = await db.add(NPC_STORE_NAME, npc);
  return npcId;
};

// Retrieves all NPCs from the database.
export const getNpcs = async () => {
  const db = await dbPromise;
  return db.getAll(NPC_STORE_NAME);
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