import { dbPromise, SESSION_STORE_NAME } from "../db";

// Adds a new session to the database.
export const addSession = async (session) => {
  const db = await dbPromise;
  const timestamp = new Date().toISOString();

  return db.add(SESSION_STORE_NAME, {
    ...session,
    createdAt: timestamp,
    modifiedAt: timestamp,
  });
};

// Retrieves all sessions for a given campaign from the database.
export const getSessions = async (campaignId) => {
  const db = await dbPromise;
  const tx = db.transaction(SESSION_STORE_NAME, "readonly");
  const index = tx.store.index("campaignId");
  return index.getAll(campaignId);
};

// Retrieves a specific session from the database by its ID.
export const getSession = async (id) => {
  const db = await dbPromise;
  return db.get(SESSION_STORE_NAME, id);
};

// Updates an existing session in the database.
export const updateSession = async (session) => {
  const db = await dbPromise;
  await db.put(SESSION_STORE_NAME, {
    ...session,
    modifiedAt: new Date().toISOString(),
  });
};

// Deletes a specific session from the database by its ID.
export const deleteSession = async (id) => {
  const db = await dbPromise;
  await db.delete(SESSION_STORE_NAME, id);
};