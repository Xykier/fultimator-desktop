import { openDB } from "idb";

const DB_NAME = "fultimatorDB";
const DB_VERSION = 3;
const NPC_STORE_NAME = "npcPersonal";
const PC_STORE_NAME = "pcPersonal";
const ENCOUNTER_STORE_NAME = "encounterStore";

// New store names for Campaign Manager
const CAMPAIGN_STORE_NAME = "campaignStore";
const SESSION_STORE_NAME = "sessionStore";
const NOTE_STORE_NAME = "noteStore";
const LOCATION_STORE_NAME = "locationStore";
const NPC_CAMPAIGN_STORE_NAME = "npcCampaign"; 
const NPC_FOLDER_STORE_NAME = "npcFolderStore";

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db, oldVersion, newVersion) {
    // Add transaction parameter
    console.log(`Upgrading DB from version ${oldVersion} to ${newVersion}`);

    // Existing stores
    if (oldVersion < 1) {
      if (!db.objectStoreNames.contains(NPC_STORE_NAME)) {
        db.createObjectStore(NPC_STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
      if (!db.objectStoreNames.contains(PC_STORE_NAME)) {
        db.createObjectStore(PC_STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    }
    if (oldVersion < 2) {
      if (!db.objectStoreNames.contains(ENCOUNTER_STORE_NAME)) {
        db.createObjectStore(ENCOUNTER_STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    }

    // New Campaign Manager stores - version 3
    if (oldVersion < 3) {
      if (!db.objectStoreNames.contains(CAMPAIGN_STORE_NAME)) {
        const campaignStore = db.createObjectStore(CAMPAIGN_STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
        campaignStore.createIndex("name", "name", { unique: false });
        campaignStore.createIndex("createdAt", "createdAt", { unique: false });
        campaignStore.createIndex("lastPlayedAt", "lastPlayedAt", {
          unique: false,
        });
      }

      if (!db.objectStoreNames.contains(SESSION_STORE_NAME)) {
        const sessionStore = db.createObjectStore(SESSION_STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
        sessionStore.createIndex("campaignId", "campaignId", { unique: false });
        sessionStore.createIndex("sessionNumber", "sessionNumber", {
          unique: false,
        });
        sessionStore.createIndex("plannedDate", "plannedDate", {
          unique: false,
        });
        sessionStore.createIndex("status", "status", { unique: false });
      }

      if (!db.objectStoreNames.contains(NOTE_STORE_NAME)) {
        const noteStore = db.createObjectStore(NOTE_STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
        noteStore.createIndex("campaignId", "campaignId", { unique: false });
        noteStore.createIndex("title", "title", { unique: false });
        noteStore.createIndex("category", "category", { unique: false });
        noteStore.createIndex("parentNoteId", "parentNoteId", {
          unique: false,
        });
        noteStore.createIndex("createdAt", "createdAt", { unique: false });
        noteStore.createIndex("modifiedAt", "modifiedAt", { unique: false });
      }

      if (!db.objectStoreNames.contains(LOCATION_STORE_NAME)) {
        const locationStore = db.createObjectStore(LOCATION_STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
        locationStore.createIndex("campaignId", "campaignId", {
          unique: false,
        });
        locationStore.createIndex("name", "name", { unique: false });
        locationStore.createIndex("parentLocationId", "parentLocationId", {
          unique: false,
        });
      }
      if (!db.objectStoreNames.contains(NPC_FOLDER_STORE_NAME)) {
        const folderStore = db.createObjectStore(NPC_FOLDER_STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
        folderStore.createIndex("campaignId", "campaignId", { unique: false });
        folderStore.createIndex("name", "name", { unique: false });
        console.log("Created 'npcFolderStore' store.");
      }

      if (!db.objectStoreNames.contains(NPC_CAMPAIGN_STORE_NAME)) {
        const npcCampaignStore = db.createObjectStore(NPC_CAMPAIGN_STORE_NAME, {
          keyPath: ["npcId", "campaignId"], // Composite key
        });
        npcCampaignStore.createIndex("npcId", "npcId", { unique: false });
        npcCampaignStore.createIndex("campaignId", "campaignId", {
          unique: false,
        });
        npcCampaignStore.createIndex("attitude", "attitude", { unique: false });
        npcCampaignStore.createIndex("folderId", "folderId", { unique: false });
        console.log("Created 'npcCampaign' store.");
      }
    }
  },
});

// NPC Functions
export const addNpc = async (npc) => {
  const db = await dbPromise;
  const npcId = await db.add(NPC_STORE_NAME, npc);
  return npcId;
};

export const getNpcs = async () => {
  const db = await dbPromise;
  return db.getAll(NPC_STORE_NAME);
};

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

export const updateNpc = async (npc) => {
  const db = await dbPromise;
  await db.put(NPC_STORE_NAME, npc);
};

export const deleteAllNpcs = async () => {
  const db = await dbPromise;
  const transaction = db.transaction(NPC_STORE_NAME, "readwrite");
  const store = transaction.objectStore(NPC_STORE_NAME);
  await store.clear();
  await transaction.done;
};

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

// PC Functions
export const addPc = async (pc) => {
  const db = await dbPromise;
  await db.add(PC_STORE_NAME, pc);
};

export const getPcs = async () => {
  const db = await dbPromise;
  return db.getAll(PC_STORE_NAME);
};

export const getPc = async (id) => {
  const db = await dbPromise;
  return db.get(PC_STORE_NAME, id);
};

export const deletePc = async (id) => {
  const db = await dbPromise;
  await db.delete(PC_STORE_NAME, id);
};

export const updatePc = async (pc) => {
  const db = await dbPromise;
  await db.put(PC_STORE_NAME, pc);
};

export const deleteAllPcs = async () => {
  const db = await dbPromise;
  const transaction = db.transaction(PC_STORE_NAME, "readwrite");
  const store = transaction.objectStore(PC_STORE_NAME);
  await store.clear();
  await transaction.done;
};

// Battle Tracker - Encounter Functions

export const addEncounter = async (encounter) => {
  const db = await dbPromise;
  const timestamp = new Date().toISOString();
  await db.add(ENCOUNTER_STORE_NAME, {
    ...encounter,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
};

export const getEncounterList = async () => {
  const db = await dbPromise;
  return db.getAll(ENCOUNTER_STORE_NAME);
};

export const getEncounter = async (id) => {
  const db = await dbPromise;
  return db.get(ENCOUNTER_STORE_NAME, id);
};

export const updateEncounter = async (encounter) => {
  const db = await dbPromise;
  await db.put(ENCOUNTER_STORE_NAME, {
    ...encounter,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteEncounter = async (id) => {
  const db = await dbPromise;
  await db.delete(ENCOUNTER_STORE_NAME, id);
};

export const deleteAllEncounters = async () => {
  const db = await dbPromise;
  const transaction = db.transaction(ENCOUNTER_STORE_NAME, "readwrite");
  const store = transaction.objectStore(ENCOUNTER_STORE_NAME);
  await store.clear();
  await transaction.done;
};

// Campaign Manager Functions

// Campaign Functions
export const addCampaign = async (campaign) => {
  const db = await dbPromise;
  const timestamp = new Date().toISOString();

  return db.add(CAMPAIGN_STORE_NAME, {
    ...campaign,
    createdAt: timestamp,
    lastPlayedAt: timestamp,
  });
};

export const getCampaigns = async () => {
  const db = await dbPromise;
  return db.getAll(CAMPAIGN_STORE_NAME);
};

export const getCampaign = async (id) => {
  const db = await dbPromise;
  return db.get(CAMPAIGN_STORE_NAME, id);
};

export const updateCampaign = async (campaign) => {
  const db = await dbPromise;
  await db.put(CAMPAIGN_STORE_NAME, {
    ...campaign,
    modifiedAt: new Date().toISOString(),
  });
};

export const updateCampaignLastPlayed = async (id) => {
  const db = await dbPromise;
  const campaign = await db.get(CAMPAIGN_STORE_NAME, id);
  if (campaign) {
    campaign.lastPlayedAt = new Date().toISOString();
    await db.put(CAMPAIGN_STORE_NAME, campaign);
  }
};

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

// Session Functions
export const addSession = async (session) => {
  const db = await dbPromise;
  const timestamp = new Date().toISOString();

  return db.add(SESSION_STORE_NAME, {
    ...session,
    createdAt: timestamp,
    modifiedAt: timestamp,
  });
};

export const getSessions = async (campaignId) => {
  const db = await dbPromise;
  const tx = db.transaction(SESSION_STORE_NAME, "readonly");
  const index = tx.store.index("campaignId");
  return index.getAll(campaignId);
};

export const getSession = async (id) => {
  const db = await dbPromise;
  return db.get(SESSION_STORE_NAME, id);
};

export const updateSession = async (session) => {
  const db = await dbPromise;
  await db.put(SESSION_STORE_NAME, {
    ...session,
    modifiedAt: new Date().toISOString(),
  });
};

export const deleteSession = async (id) => {
  const db = await dbPromise;
  await db.delete(SESSION_STORE_NAME, id);
};

// Note Functions
export const addNote = async (note) => {
  const db = await dbPromise;
  const timestamp = new Date().toISOString();

  return db.add(NOTE_STORE_NAME, {
    ...note,
    createdAt: timestamp,
    modifiedAt: timestamp,
  });
};

export const getNotes = async (campaignId, parentNoteId = null) => {
  const db = await dbPromise;
  const tx = db.transaction(NOTE_STORE_NAME, "readonly");
  const index = tx.store.index("campaignId");
  const notes = await index.getAll(campaignId);

  // Filter by parentNoteId if specified
  if (parentNoteId !== null) {
    return notes.filter((note) => note.parentNoteId === parentNoteId);
  }

  return notes;
};

export const getNoteHierarchy = async (campaignId) => {
  const db = await dbPromise;
  const tx = db.transaction(NOTE_STORE_NAME, "readonly");
  const index = tx.store.index("campaignId");
  const notes = await index.getAll(campaignId);

  // Create a hierarchical structure of notes
  const rootNotes = notes.filter((note) => !note.parentNoteId);

  // Recursive function to build note tree
  const buildNoteTree = (parentId) => {
    return notes
      .filter((note) => note.parentNoteId === parentId)
      .map((note) => ({
        ...note,
        children: buildNoteTree(note.id),
      }));
  };

  return rootNotes.map((note) => ({
    ...note,
    children: buildNoteTree(note.id),
  }));
};

export const getNote = async (id) => {
  const db = await dbPromise;
  return db.get(NOTE_STORE_NAME, id);
};

export const updateNote = async (note) => {
  const db = await dbPromise;
  await db.put(NOTE_STORE_NAME, {
    ...note,
    modifiedAt: new Date().toISOString(),
  });
};

export const deleteNote = async (id) => {
  const db = await dbPromise;
  // Start a transaction to delete the note and all child notes
  const tx = db.transaction(NOTE_STORE_NAME, "readwrite");

  // Helper function to recursively delete child notes
  const deleteChildren = async (parentId) => {
    const index = tx.store.index("parentNoteId");
    const childrenCursor = await index.openCursor(parentId);

    while (childrenCursor) {
      const childId = childrenCursor.value.id;
      await deleteChildren(childId);
      await childrenCursor.delete();
      await childrenCursor.continue();
    }
  };

  // Delete all child notes
  await deleteChildren(id);

  // Delete the note itself
  await tx.store.delete(id);

  // Commit the transaction
  await tx.done;
};

// Location Functions
export const addLocation = async (location) => {
  const db = await dbPromise;
  const timestamp = new Date().toISOString();

  return db.add(LOCATION_STORE_NAME, {
    ...location,
    createdAt: timestamp,
    modifiedAt: timestamp,
  });
};

export const getLocations = async (campaignId, parentLocationId = null) => {
  const db = await dbPromise;
  const tx = db.transaction(LOCATION_STORE_NAME, "readonly");
  const index = tx.store.index("campaignId");
  const locations = await index.getAll(campaignId);

  // Filter by parentLocationId if specified
  if (parentLocationId !== null) {
    return locations.filter(
      (location) => location.parentLocationId === parentLocationId
    );
  }

  return locations;
};

export const getLocationHierarchy = async (campaignId) => {
  const db = await dbPromise;
  const tx = db.transaction(LOCATION_STORE_NAME, "readonly");
  const index = tx.store.index("campaignId");
  const locations = await index.getAll(campaignId);

  // Create a hierarchical structure of locations
  const rootLocations = locations.filter(
    (location) => !location.parentLocationId
  );

  // Recursive function to build location tree
  const buildLocationTree = (parentId) => {
    return locations
      .filter((location) => location.parentLocationId === parentId)
      .map((location) => ({
        ...location,
        children: buildLocationTree(location.id),
      }));
  };

  return rootLocations.map((location) => ({
    ...location,
    children: buildLocationTree(location.id),
  }));
};

export const getLocation = async (id) => {
  const db = await dbPromise;
  return db.get(LOCATION_STORE_NAME, id);
};

export const updateLocation = async (location) => {
  const db = await dbPromise;
  await db.put(LOCATION_STORE_NAME, {
    ...location,
    modifiedAt: new Date().toISOString(),
  });
};

export const deleteLocation = async (id) => {
  const db = await dbPromise;
  // Start a transaction to delete the location and all child locations
  const tx = db.transaction(LOCATION_STORE_NAME, "readwrite");

  // Helper function to recursively delete child locations
  const deleteChildren = async (parentId) => {
    const index = tx.store.index("parentLocationId");
    const childrenCursor = await index.openCursor(parentId);

    while (childrenCursor) {
      const childId = childrenCursor.value.id;
      await deleteChildren(childId);
      await childrenCursor.delete();
      await childrenCursor.continue();
    }
  };

  // Delete all child locations
  await deleteChildren(id);

  // Delete the location itself
  await tx.store.delete(id);

  // Commit the transaction
  await tx.done;
};

// Relationship functions - linking entities
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

export const disassociateNpcFromCampaign = async (npcId, campaignId) => {
  const db = await dbPromise;
  await db.delete(NPC_CAMPAIGN_STORE_NAME, [npcId, campaignId]);
};

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

export const disassociatePcFromCampaign = async (pcId, campaignId) => {
  const db = await dbPromise;
  const pc = await db.get(PC_STORE_NAME, pcId);

  if (pc && pc.campaigns && Array.isArray(pc.campaigns)) {
    pc.campaigns = pc.campaigns.filter((id) => id !== campaignId);
    await db.put(PC_STORE_NAME, pc);
  }
};

// --- NPC Folder Functions ---

export const addNpcFolder = async (folder) => {
  const db = await dbPromise;
  // Ensure campaignId is present
  if (!folder.campaignId) {
    throw new Error("campaignId is required to create an NPC folder.");
  }
  const folderToAdd = {
    ...folder,
    createdAt: new Date().toISOString(),
  };
  return db.add(NPC_FOLDER_STORE_NAME, folderToAdd);
};

export const getNpcFoldersForCampaign = async (campaignId) => {
  const db = await dbPromise;
  const tx = db.transaction(NPC_FOLDER_STORE_NAME, "readonly");
  const index = tx.store.index("campaignId");
  return index.getAll(campaignId);
};

export const updateNpcFolder = async (folder) => {
  const db = await dbPromise;
  const folderToUpdate = {
    ...folder,
    modifiedAt: new Date().toISOString(),
  };
  await db.put(NPC_FOLDER_STORE_NAME, folderToUpdate);
};

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

export const deleteNpcFolder = async (folderId, campaignId) => {
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
      await cursor.update(updatedNpcCampaign);
    }
    cursor = await cursor.continue();
  }

  // Delete the folder
  await folderStore.delete(folderId);

  await tx.done;
  console.log(`Deleted folder ${folderId} and moved its NPCs to root.`);
};

export const updateNpcCampaignFolder = async (npcId, campaignId, folderId) => {
  const db = await dbPromise;
  const npcCampaign = await db.get(NPC_CAMPAIGN_STORE_NAME, [npcId, campaignId]);

  if (npcCampaign) {
    const updatedNpcCampaign = { ...npcCampaign, folderId: folderId };
    await db.put(NPC_CAMPAIGN_STORE_NAME, updatedNpcCampaign);
  } else {
    console.error("NPC campaign data not found for npcId:", npcId, "and campaignId:", campaignId);
    throw new Error("NPC campaign data not found");
  }
};
