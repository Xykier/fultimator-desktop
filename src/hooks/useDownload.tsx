import { useState } from "react";
import DownloadSnackbar from "../components/common/DownloadSnackbar";

// useDownload exposes a function that makes the browser download a file
function useDownload() {
  const [downloadedFilePath, setDownloadedFilePath] = useState<string>("");
  const [showSnackbar, setShowSnackbar] = useState(false);

  async function download(content: string, fileName: string) {
    fileName = fileName.replace(/\s/g, "_").toLowerCase();
    
    try {
      // Convert data URL to buffer if needed
      let buffer;
      if (content.startsWith('data:')) {
        const response = await fetch(content);
        const blob = await response.blob();
        buffer = new Uint8Array(await blob.arrayBuffer());
      } else {
        const response = await fetch(content);
        buffer = new Uint8Array(await response.arrayBuffer());
      }

      // Save file using Electron
      const filePath = await window.electron.saveFile(fileName, buffer);
      setDownloadedFilePath(filePath);
      setShowSnackbar(true);
    } catch (error) {
      console.error('Failed to save file:', error);
    }
  }

  function handleCloseSnackbar() {
    setShowSnackbar(false);
  }

  return [
    download,
    showSnackbar ? (
      <DownloadSnackbar
        open={showSnackbar}
        onClose={handleCloseSnackbar}
        filePath={downloadedFilePath}
      />
    ) : null,
  ] as const;
}

export default useDownload;