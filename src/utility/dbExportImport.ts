import {
  getNpcs,
  getPcs,
  addNpc,
  addPc,
  deleteAllNpcs,
  deleteAllPcs,
} from "./db";

// Export function for both NPCs and PCs
export const exportDatabase = async () => {
  try {
    // Fetch data from both stores
    const [npcs, pcs] = await Promise.all([getNpcs(), getPcs()]);

    // Create a combined object to export
    const data = {
      npcs,
      pcs,
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

// Import function for both NPCs and PCs
export const importDatabase = async (file: File) => {
  try {
    const text = await file.text();
    const data = JSON.parse(text);

    if (
      !data.npcs ||
      !Array.isArray(data.npcs) ||
      !data.pcs ||
      !Array.isArray(data.pcs)
    ) {
      throw new Error("Invalid file format");
    }

    // Clear existing data from both stores
    await Promise.all([deleteAllNpcs(), deleteAllPcs()]);

    // Add new data to both stores
    await Promise.all([
      ...data.npcs.map((npc: any) => addNpc(npc)),
      ...data.pcs.map((pc: any) => addPc(pc)),
    ]);
  } catch (error) {
    console.error("Failed to import database", error);
    throw error;
  }
};

export const handleExport = async (): Promise<string> => {
  try {
    // Fetch data from both stores
    const [npcs, pcs] = await Promise.all([getNpcs(), getPcs()]);

    // Create a combined object to export
    const data = {
      npcs,
      pcs,
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

    // Fetch the file using the file path
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error("Failed to fetch the downloaded file");
    }
    const text = await response.text();
    console.log("File content fetched successfully");

    // Create a File object from the file content
    const file = new File([text], "fultimatordb.json", {
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
