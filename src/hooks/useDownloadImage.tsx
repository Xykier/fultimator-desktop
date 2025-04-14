import { useCallback } from "react";
import html2canvas from "html2canvas";
import { useCustomTheme } from "./useCustomTheme";
import useDownload from "./useDownload";

const useDownloadImage = (name: string, ref: React.RefObject<HTMLDivElement>) => {
  const theme = useCustomTheme();
  const [download, snackbar] = useDownload();
  
  const downloadImage = useCallback(async () => {
    const background = theme.mode === 'dark' ? `#1f1f1f` : `#ffffff`;

    if (ref.current) {
      try {
        const canvas = await html2canvas(ref.current, {
          logging: true,
          useCORS: true,
          scale: 2,
          backgroundColor: `${background}`,
        });
        const dataURL = canvas.toDataURL('image/png', 1.0);
        const formattedName = name.replace(/\s+/g, '_').toLowerCase();
        await download(dataURL, `${formattedName}.png`);
      } catch (error) {
        console.error('Failed to capture screenshot:', error);
      }
    }
  }, [name, ref, theme.mode, download]);

  return [downloadImage, snackbar] as const;
};

export default useDownloadImage;
