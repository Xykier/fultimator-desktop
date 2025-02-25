import { openDB } from 'idb';

const DB_NAME = 'fultimatorDB';
const DB_VERSION = 2;
const NPC_STORE_NAME = 'npcPersonal';
const PC_STORE_NAME = 'pcPersonal';
const ENCOUNTER_STORE_NAME = 'encounterStore';

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db, oldVersion, newVersion, transaction) {
    console.log(`Upgrading DB from version ${oldVersion} to ${newVersion}`);

    if (oldVersion < 1) {
      db.createObjectStore("npcPersonal", { keyPath: "id", autoIncrement: true });
      db.createObjectStore("pcPersonal", { keyPath: "id", autoIncrement: true });
    }
    if (oldVersion < 2) {
      if (!db.objectStoreNames.contains("encounterStore")) {
        db.createObjectStore("encounterStore", { keyPath: "id", autoIncrement: true });
      }
    }
  },
});

// NPC Functions
export const addNpc = async (npc) => {
  const db = await dbPromise;
  await db.add(NPC_STORE_NAME, npc);
};

export const getNpcs = async () => {
  const db = await dbPromise;
  return db.getAll(NPC_STORE_NAME);
};

export const deleteNpc = async (id) => {
  const db = await dbPromise;
  await db.delete(NPC_STORE_NAME, id);
};

export const updateNpc = async (npc) => {
  const db = await dbPromise;
  await db.put(NPC_STORE_NAME, npc);
};

export const deleteAllNpcs = async () => {
  const db = await dbPromise;
  const transaction = db.transaction(NPC_STORE_NAME, 'readwrite');
  const store = transaction.objectStore(NPC_STORE_NAME);
  await store.clear();
  await transaction.done;
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
  const transaction = db.transaction(PC_STORE_NAME, 'readwrite');
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