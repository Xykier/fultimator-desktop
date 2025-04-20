import { dbPromise, PC_STORE_NAME } from "../db";

// Adds a new PC to the database.
export const addPc = async (pc) => {
  const db = await dbPromise;
  await db.add(PC_STORE_NAME, pc);
};

// Retrieves all PCs from the database.
export const getPcs = async () => {
  const db = await dbPromise;
  return db.getAll(PC_STORE_NAME);
};

// Retrieves a specific PC from the database by its ID.
export const getPc = async (id) => {
  const db = await dbPromise;
  return db.get(PC_STORE_NAME, id);
};

// Deletes a specific PC from the database by its ID.
export const deletePc = async (id) => {
  const db = await dbPromise;
  await db.delete(PC_STORE_NAME, id);
};

// Updates an existing PC in the database.
export const updatePc = async (pc) => {
  const db = await dbPromise;
  await db.put(PC_STORE_NAME, pc);
};

// Deletes all PCs from the database.
export const deleteAllPcs = async () => {
  const db = await dbPromise;
  const transaction = db.transaction(PC_STORE_NAME, "readwrite");
  const store = transaction.objectStore(PC_STORE_NAME);
  await store.clear();
  await transaction.done;
};