declare global {
  interface Window {
    electron: {
      confirm(message: string): Promise<boolean>;
      alert(message: string): Promise<void>;
      getVersion(): Promise<string>;
      uploadToGoogleDrive(filePath: string): Promise<void>;
      downloadFromGoogleDrive(fileId: string): Promise<string>;
      saveFile(fileName: string, buffer: Uint8Array): Promise<string>;
      listFiles(): Promise<{ id: string; name: string }[]>;
      logoutGoogle(): Promise<void>;
      readFile(filePath: string): Promise<string>;
      loginWithGoogle(): Promise<void>;
      checkAuth(): Promise<{ isAuthenticated: boolean; tokens?: any }>;
      openExternal(url: string): void;
      checkForUpdates(): Promise<void>;
      openFile(filePath: string): Promise<void>;
      showFileInFolder(filePath: string): Promise<void>;
    };
  }
}

export {};
