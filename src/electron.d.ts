declare global {
    interface Window {
      electron: {
        confirm(message: string): Promise<boolean>;
        alert(message: string): Promise<void>;
        getVersion(): string;
      };
    }
  }
  
  export {};
  