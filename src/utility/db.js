import { openDB } from 'idb';

const DB_NAME = 'fultimatorDB';
const NPC_STORE_NAME = 'npcPersonal';
const PC_STORE_NAME = 'pcPersonal';

const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(NPC_STORE_NAME)) {
      db.createObjectStore(NPC_STORE_NAME, {
        keyPath: 'id',
        autoIncrement: true,
      });
    }
    if (!db.objectStoreNames.contains(PC_STORE_NAME)) {
      db.createObjectStore(PC_STORE_NAME, {
        keyPath: 'id',
        autoIncrement: true,
      });
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