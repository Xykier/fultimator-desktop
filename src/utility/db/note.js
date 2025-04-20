import { dbPromise, NOTE_STORE_NAME } from "../db";

// Adds a new note to the database.
export const addNote = async (note) => {
  const db = await dbPromise;
  const timestamp = new Date().toISOString();

  return db.add(NOTE_STORE_NAME, {
    ...note,
    createdAt: timestamp,
    modifiedAt: timestamp,
  });
};

// Retrieves notes from the database based on campaign ID and optional parent note ID.
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

// Retrieves a hierarchical structure of notes for a given campaign.
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

// Retrieves a specific note from the database by its ID.
export const getNote = async (id) => {
  const db = await dbPromise;
  return db.get(NOTE_STORE_NAME, id);
};

// Updates an existing note in the database.
export const updateNote = async (note) => {
  const db = await dbPromise;
  await db.put(NOTE_STORE_NAME, {
    ...note,
    modifiedAt: new Date().toISOString(),
  });
};

// Deletes a note and all its child notes from the database.
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