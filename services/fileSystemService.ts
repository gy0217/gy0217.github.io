
/**
 * 物理磁盘同步引擎
 */
export class FileSystemService {
  private directoryHandle: any | null = null;
  private readonly DB_NAME = 'PersonaFileSystem';
  private readonly STORE_NAME = 'Handles';
  private readonly KEY = 'lastFolder';

  isSupported(): boolean {
    return 'showDirectoryPicker' in window;
  }

  private async saveToDB(handle: any) {
    return new Promise((resolve) => {
      const request = indexedDB.open(this.DB_NAME, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(this.STORE_NAME)) {
          request.result.createObjectStore(this.STORE_NAME);
        }
      };
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction(this.STORE_NAME, 'readwrite');
        tx.objectStore(this.STORE_NAME).put(handle, this.KEY);
        tx.oncomplete = () => resolve(true);
      };
    });
  }

  async getFromDB(): Promise<any> {
    return new Promise((resolve) => {
      const request = indexedDB.open(this.DB_NAME, 1);
      request.onsuccess = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) return resolve(null);
        const getReq = db.transaction(this.STORE_NAME, 'readonly').objectStore(this.STORE_NAME).get(this.KEY);
        getReq.onsuccess = () => resolve(getReq.result);
        getReq.onerror = () => resolve(null);
      };
      request.onupgradeneeded = () => request.result.createObjectStore(this.STORE_NAME);
      request.onerror = () => resolve(null);
    });
  }

  async requestFolder(): Promise<string | null> {
    if (!this.isSupported()) return null;
    try {
      // @ts-ignore
      this.directoryHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
      await this.saveToDB(this.directoryHandle);
      return this.directoryHandle?.name || null;
    } catch {
      return null;
    }
  }

  async verifyPermission(): Promise<boolean> {
    if (!this.directoryHandle) return false;
    const opts = { mode: 'readwrite' };
    if ((await this.directoryHandle.queryPermission(opts)) === 'granted') return true;
    try {
      return (await this.directoryHandle.requestPermission(opts)) === 'granted';
    } catch {
      return false;
    }
  }

  async tryRestore(): Promise<string | null> {
    const handle = await this.getFromDB();
    if (handle) {
      this.directoryHandle = handle;
      return handle.name;
    }
    return null;
  }

  async saveToDisk(filename: string, data: any) {
    if (!this.directoryHandle) return;
    try {
      if (!await this.verifyPermission()) return;
      const fileHandle = await this.directoryHandle.getFileHandle(filename, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(data, null, 2));
      await writable.close();
    } catch (e) {
      console.error("写入失败", e);
    }
  }

  async loadFromDisk(filename: string): Promise<any | null> {
    if (!this.directoryHandle) return null;
    try {
      if (!await this.verifyPermission()) return null;
      const fileHandle = await this.directoryHandle.getFileHandle(filename);
      const file = await fileHandle.getFile();
      const text = await file.text();
      return JSON.parse(text);
    } catch {
      return null;
    }
  }
}

export const fileSystemService = new FileSystemService();
