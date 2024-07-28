import { openDB } from 'idb';

const DB_NAME = 'npcGalleryDB';
const STORE_NAME = 'npcPersonal';

const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, {
        keyPath: 'id',
        autoIncrement: true,
      });
    }
  },
});

export const addNpc = async (npc) => {
  const db = await dbPromise;
  await db.add(STORE_NAME, npc);
};

export const getNpcs = async () => {
  const db = await dbPromise;
  return db.getAll(STORE_NAME);
};

export const deleteNpc = async (id) => {
  const db = await dbPromise;
  await db.delete(STORE_NAME, id);
};

export const updateNpc = async (npc) => {
  const db = await dbPromise;
  await db.put(STORE_NAME, npc);
};

export const deleteAllNpcs = async () => {
  const db = await dbPromise;
  const transaction = db.transaction(STORE_NAME, 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  await store.clear();
  await transaction.done;
};