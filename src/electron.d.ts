declare global {
  interface Window {
    electron: {
      confirm(message: string): Promise<boolean>;
      alert(message: string): Promise<void>;
      getVersion(): string;
      authenticateGoogle(): Promise<void>;
      uploadToGoogleDrive(filePath: string): Promise<void>;
      downloadFromGoogleDrive(fileId: string): Promise<string>;
      saveFile(fileName: string, buffer: Uint8Array): Promise<string>;
      listFiles(): Promise<{ id: string; name: string }[]>;
      checkAuthentication(): Promise<boolean>;
      logoutGoogle(): Promise<void>;
    };
  }
}

export {};
