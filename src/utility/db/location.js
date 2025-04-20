import { dbPromise, LOCATION_STORE_NAME } from "../db";

// Adds a new location to the database.
export const addLocation = async (location) => {
  const db = await dbPromise;
  const timestamp = new Date().toISOString();

  return db.add(LOCATION_STORE_NAME, {
    ...location,
    createdAt: timestamp,
    modifiedAt: timestamp,
  });
};

// Retrieves locations from the database based on campaign ID and optional parent location ID.
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

// Retrieves a hierarchical structure of locations for a given campaign.
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

// Retrieves a specific location from the database by its ID.
export const getLocation = async (id) => {
  const db = await dbPromise;
  return db.get(LOCATION_STORE_NAME, id);
};

// Updates an existing location in the database.
export const updateLocation = async (location) => {
  const db = await dbPromise;
  await db.put(LOCATION_STORE_NAME, {
    ...location,
    modifiedAt: new Date().toISOString(),
  });
};

// Deletes a location and all its child locations from the database.
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