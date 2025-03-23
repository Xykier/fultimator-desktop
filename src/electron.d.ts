declare global {
  interface Window {
    electron: {
      confirm(message: string): Promise<boolean>;
      alert(message: string): Promise<void>;
      getVersion(): Promise<string>;
      authenticateGoogle(): Promise<string>; // Updated to return a string message
      uploadToGoogleDrive(filePath: string): Promise<void>;
      downloadFromGoogleDrive(fileId: string): Promise<string>;
      saveFile(fileName: string, buffer: Uint8Array): Promise<string>;
      listFiles(): Promise<{ id: string; name: string }[]>;
      checkAuthentication(): Promise<boolean>;
      logoutGoogle(): Promise<void>;
      readFile(filePath: string): Promise<string>;
    };
  }
}

export {};
