import { getNpcs, getPcs, addNpc, addPc, deleteAllNpcs, deleteAllPcs } from './db';

// Export function for both NPCs and PCs
export const exportDatabase = async () => {
  try {
    // Fetch data from both stores
    const [npcs, pcs] = await Promise.all([getNpcs(), getPcs()]);

    // Create a combined object to export
    const data = {
      npcs,
      pcs
    };

    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'database.json';
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

    if (!data.npcs || !Array.isArray(data.npcs) || !data.pcs || !Array.isArray(data.pcs)) {
      throw new Error("Invalid file format");
    }

    // Clear existing data from both stores
    await Promise.all([deleteAllNpcs(), deleteAllPcs()]);

    // Add new data to both stores
    await Promise.all([
      ...data.npcs.map((npc: any) => addNpc(npc)),
      ...data.pcs.map((pc: any) => addPc(pc))
    ]);
  } catch (error) {
    console.error("Failed to import database", error);
    throw error;
  }
};
