import { dbPromise, ENCOUNTER_STORE_NAME } from "../db";

// Adds a new encounter to the database.
export const addEncounter = async (encounter) => {
  const db = await dbPromise;
  const timestamp = new Date().toISOString();
  await db.add(ENCOUNTER_STORE_NAME, {
    ...encounter,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
};

// Retrieves all encounters from the database.
export const getEncounterList = async () => {
  const db = await dbPromise;
  return db.getAll(ENCOUNTER_STORE_NAME);
};

// Retrieves a specific encounter from the database by its ID.
export const getEncounter = async (id) => {
  const db = await dbPromise;
  return db.get(ENCOUNTER_STORE_NAME, id);
};

// Updates an existing encounter in the database.
export const updateEncounter = async (encounter) => {
  const db = await dbPromise;
  await db.put(ENCOUNTER_STORE_NAME, {
    ...encounter,
    updatedAt: new Date().toISOString(),
  });
};

// Deletes a specific encounter from the database by its ID.
export const deleteEncounter = async (id) => {
  const db = await dbPromise;
  await db.delete(ENCOUNTER_STORE_NAME, id);
};

// Deletes all encounters from the database.
export const deleteAllEncounters = async () => {
  const db = await dbPromise;
  const transaction = db.transaction(ENCOUNTER_STORE_NAME, "readwrite");
  const store = transaction.objectStore(ENCOUNTER_STORE_NAME);
  await store.clear();
  await transaction.done;
};