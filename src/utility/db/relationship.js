import { dbPromise, NPC_STORE_NAME, PC_STORE_NAME, NPC_CAMPAIGN_STORE_NAME } from "../db";

// Retrieves all NPCs related to a specific campaign.
export const getRelatedNpcs = async (campaignId) => {
  const db = await dbPromise;
  const npcs = await db.getAll(NPC_STORE_NAME);
  const relatedNpcs = [];

  for (const npc of npcs) {
    const npcCampaign = await db.get(NPC_CAMPAIGN_STORE_NAME, [npc.id, campaignId]);
    if (npcCampaign) {
      relatedNpcs.push({
        ...npc,
        attitude: npcCampaign.attitude,
        folderId: npcCampaign.folderId,
      });
    }
  }

  return relatedNpcs;
};

// Retrieves all PCs related to a specific campaign.
export const getRelatedPcs = async (campaignId) => {
  const db = await dbPromise;
  const pcs = await db.getAll(PC_STORE_NAME);

  // Filter PCs with campaign association
  return pcs.filter(
    (pc) =>
      pc.campaignId === campaignId ||
      (pc.campaigns &&
        Array.isArray(pc.campaigns) &&
        pc.campaigns.includes(campaignId))
  );
};

// Associates an NPC with a campaign, creating or updating the NPC's campaign data.
export const associateNpcWithCampaign = async (npcId, campaignId) => {
  const db = await dbPromise;
  const npc = await db.get(NPC_STORE_NAME, npcId);

  if (npc) {
    // Initialize campaigns array if it doesn't exist
    if (!npc.campaigns || !Array.isArray(npc.campaigns)) {
      npc.campaigns = [];
    }

    // Set default attitude if not present
    if (npc.attitude === undefined || npc.attitude === null) {
      npc.attitude = "neutral";
    }

    // Add campaignId if not already present
    if (!npc.campaigns.includes(campaignId)) {
      npc.campaigns.push(campaignId);
    }

    // Get the existing campaign data or create a new object
    let npcCampaign = await db.get(NPC_CAMPAIGN_STORE_NAME, [
      npcId,
      campaignId,
    ]);

    if (!npcCampaign) {
      npcCampaign = {
        npcId: npcId,
        campaignId: campaignId,
        attitude: "neutral",
        folderId: null,
      };
    }

    // Update the NPC record
    await db.put(NPC_CAMPAIGN_STORE_NAME, npcCampaign);
  }
};

// Disassociates an NPC from a campaign by deleting the NPC's campaign data.
export const disassociateNpcFromCampaign = async (npcId, campaignId) => {
  const db = await dbPromise;
  await db.delete(NPC_CAMPAIGN_STORE_NAME, [npcId, campaignId]);
};

// Associates a PC with a campaign by adding the campaign ID to the PC's campaigns array.
export const associatePcWithCampaign = async (pcId, campaignId) => {
  const db = await dbPromise;
  const pc = await db.get(PC_STORE_NAME, pcId);

  if (pc) {
    // Initialize campaigns array if it doesn't exist
    if (!pc.campaigns || !Array.isArray(pc.campaigns)) {
      pc.campaigns = [];
    }

    // Add campaignId if not already present
    if (!pc.campaigns.includes(campaignId)) {
      pc.campaigns.push(campaignId);
      await db.put(PC_STORE_NAME, pc);
    }
  }
};

// Disassociates a PC from a campaign by removing the campaign ID from the PC's campaigns array.
export const disassociatePcFromCampaign = async (pcId, campaignId) => {
  const db = await dbPromise;
  const pc = await db.get(PC_STORE_NAME, pcId);

  if (pc && pc.campaigns && Array.isArray(pc.campaigns)) {
    pc.campaigns = pc.campaigns.filter((c) => c !== campaignId);
    await db.put(PC_STORE_NAME, pc);
  }
};