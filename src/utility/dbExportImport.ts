import { getNpcs, addNpc, deleteAllNpcs } from './db';

export const exportDatabase = async () => {
  const npcs = await getNpcs();
  const blob = new Blob([JSON.stringify(npcs)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'database.json';
  a.click();
};

export const importDatabase = async (file: File) => {
  try {
    const text = await file.text();
    const npcs = JSON.parse(text);
    if (!Array.isArray(npcs)) {
      throw new Error("Invalid file format");
    }
    await deleteAllNpcs(); // Clear existing data
    for (const npc of npcs) {
      await addNpc(npc);
    }
  } catch (error) {
    console.error("Failed to import database", error);
    throw error;
  }
};
