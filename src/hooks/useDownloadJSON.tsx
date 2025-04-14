import useDownload from "./useDownload";

// useDownloadJSON exposes a function that converts the given data to json and downloads it
function useDownloadJSON(name: string, data: any) {
  const [download, snackbar] = useDownload();

  async function downloadJSON() {
    const jsonData = JSON.stringify(data);
    const file = new Blob([jsonData], { type: "text/json" });
    await download(URL.createObjectURL(file), name + ".json");
  }

  function copyJSONToClipboard() {
    const jsonData = JSON.stringify(data);
    navigator.clipboard.writeText(jsonData);
  }

  return [downloadJSON, copyJSONToClipboard, snackbar] as const;
}

export default useDownloadJSON;
