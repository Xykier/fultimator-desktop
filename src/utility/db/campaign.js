import { dbPromise, CAMPAIGN_STORE_NAME, SESSION_STORE_NAME, NOTE_STORE_NAME, LOCATION_STORE_NAME } from "../db";

// Adds a new campaign to the database.
export const addCampaign = async (campaign) => {
  const db = await dbPromise;
  const timestamp = new Date().toISOString();

  return db.add(CAMPAIGN_STORE_NAME, {
    ...campaign,
    createdAt: timestamp,
    lastPlayedAt: timestamp,
  });
};

// Retrieves all campaigns from the database.
export const getCampaigns = async () => {
  const db = await dbPromise;
  return db.getAll(CAMPAIGN_STORE_NAME);
};

// Retrieves a specific campaign from the database by its ID.
export const getCampaign = async (id) => {
  const db = await dbPromise;
  return db.get(CAMPAIGN_STORE_NAME, id);
};

// Updates an existing campaign in the database.
export const updateCampaign = async (campaign) => {
  const db = await dbPromise;
  await db.put(CAMPAIGN_STORE_NAME, {
    ...campaign,
    modifiedAt: new Date().toISOString(),
  });
};

// Updates the last played at timestamp for a specific campaign.
export const updateCampaignLastPlayed = async (id) => {
  const db = await dbPromise;
  const campaign = await db.get(CAMPAIGN_STORE_NAME, id);
  if (campaign) {
    campaign.lastPlayedAt = new Date().toISOString();
    await db.put(CAMPAIGN_STORE_NAME, campaign);
  }
};

// Deletes a campaign and all related entities (sessions, notes, locations) from the database.
export const deleteCampaign = async (id) => {
  const db = await dbPromise;
  // Start a transaction to delete the campaign and all related entities
  const tx = db.transaction(
    [
      CAMPAIGN_STORE_NAME,
      SESSION_STORE_NAME,
      NOTE_STORE_NAME,
      LOCATION_STORE_NAME,
    ],
    "readwrite"
  );

  // Delete the campaign
  await tx.objectStore(CAMPAIGN_STORE_NAME).delete(id);

  // Delete all sessions for this campaign
  const sessionsCursor = await tx
    .objectStore(SESSION_STORE_NAME)
    .index("campaignId")
    .openCursor(id);
  while (sessionsCursor) {
    await sessionsCursor.delete();
    await sessionsCursor.continue();
  }

  // Delete all notes for this campaign
  const notesCursor = await tx
    .objectStore(NOTE_STORE_NAME)
    .index("campaignId")
    .openCursor(id);
  while (notesCursor) {
    await notesCursor.delete();
    await notesCursor.continue();
  }

  // Delete all locations for this campaign
  const locationsCursor = await tx
    .objectStore(LOCATION_STORE_NAME)
    .index("campaignId")
    .openCursor(id);
  while (locationsCursor) {
    await locationsCursor.delete();
    await locationsCursor.continue();
  }

  // Commit the transaction
  await tx.done;
};