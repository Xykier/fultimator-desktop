import {
  getNpcs,
  getPcs,
  addNpc,
  addPc,
  addEncounter,
  deleteAllNpcs,
  deleteAllPcs,
  getEncounterList,
  deleteAllEncounters,
} from "./db.js";

// Export function for both NPCs and PCs
export const exportDatabase = async () => {
  try {
    // Fetch data from both stores
    const [npcs, pcs, encounters] = await Promise.all([
      getNpcs() || [],
      getPcs() || [],
      getEncounterList() || [],
    ]);

    // Create a combined object to export
    const data = {
      npcs,
      pcs,
      encounters,
    };

    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fultimatordb.json";
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to export database", error);
    throw error;
  }
};

// Import function for NPCs, PCs and encounters
export const importDatabase = async (file: File) => {
  try {
    const text = await file.text();
    const data = JSON.parse(text);

    // Ensure backward compatibility
    const npcs = Array.isArray(data.npcs) ? data.npcs : [];
    const pcs = Array.isArray(data.pcs) ? data.pcs : [];
    const encounters = Array.isArray(data.encounters) ? data.encounters : []; // Handle missing encounters

    // Clear existing data from both stores
    await Promise.all([deleteAllNpcs(), deleteAllPcs(), deleteAllEncounters()]);

    // Add new data to both stores
    await Promise.all([
      ...npcs.map((npc: any) => addNpc(npc)),
      ...pcs.map((pc: any) => addPc(pc)),
      ...encounters.map((encounter: any) => addEncounter(encounter)),
    ]);

    console.log("Database successfully imported");
  } catch (error) {
    console.error("Failed to import database", error);
    throw error;
  }
};


export const handleExport = async (): Promise<string> => {
  try {
    // Fetch data from all stores
    const [npcs, pcs, encounters] = await Promise.all([
      getNpcs(),
      getPcs(),
      getEncounterList(),
    ]);

    // Create a combined object to export
    const data = {
      npcs,
      pcs,
      encounters,
    };

    // Create a blob with the data
    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Save the file and get the file path
    const filePath = await window.electron.saveFile(
      "fultimatordb.json",
      buffer
    );

    console.log("File saved at path:", filePath); // Log the file path

    // Upload the file using its path
    await window.electron.uploadToGoogleDrive(filePath);

    return "Database successfully exported and uploaded to Google Drive!";
  } catch (error) {
    console.error("Failed to export and upload database", error);
    return "Failed to export and upload database.";
  }
};

export const handleImport = async (fileId: string): Promise<string> => {
  try {
    console.log("Downloading file with ID:", fileId); // Log file ID
    // Download the file from Google Drive and get the file path
    const filePath = await window.electron.downloadFromGoogleDrive(fileId);
    console.log("File downloaded to path:", filePath);

    // Read the file content using Electron's file system API
    const fileContent = await window.electron.readFile(filePath);

    // Create a File object from the file content
    const file = new File([fileContent], "fultimatordb.json", {
      type: "application/json",
    });

    // Import the downloaded file into IndexedDB
    await importDatabase(file);

    return "Database successfully imported from Google Drive!";
  } catch (error) {
    console.error("Failed to download and import database", error);
    return "Failed to download and import database.";
  }
};
