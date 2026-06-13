'use client';

// ─── IndexedDB — almacenamiento de canciones ─────────────────
// DB: vocalia-songs  v1
// Stores: "songs" (metadata, keyPath=id) | "audio" (Blob, explicit key)

import type { SongAnalysis, SongPerformance } from '@/types';

export interface StoredSong {
  id: string;
  fileName: string;
  title: string;
  artist: string;
  mimeType: string;
  size: number;
  duration: number;
  analysis: SongAnalysis | null;
  performances: SongPerformance[];
  addedAt: number;
}

const DB_NAME = 'vocalia-songs';
const DB_VER = 1;
const SONGS = 'songs';
const AUDIO = 'audio';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = e => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(SONGS)) db.createObjectStore(SONGS, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(AUDIO)) db.createObjectStore(AUDIO);
    };
    req.onsuccess = e => resolve((e.target as IDBOpenDBRequest).result);
    req.onerror  = e => reject((e.target as IDBOpenDBRequest).error);
  });
}

function uid(): string {
  return `song_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Helpers promisificados ──────────────────────────────────

function put<T>(store: IDBObjectStore, value: T, key?: IDBValidKey): Promise<void> {
  return new Promise((res, rej) => {
    const req = key !== undefined ? store.put(value, key) : store.put(value);
    req.onsuccess = () => res();
    req.onerror   = () => rej(req.error);
  });
}

function get<T>(store: IDBObjectStore, key: IDBValidKey): Promise<T | undefined> {
  return new Promise((res, rej) => {
    const req = store.get(key);
    req.onsuccess = () => res(req.result as T);
    req.onerror   = () => rej(req.error);
  });
}

function getAll<T>(store: IDBObjectStore): Promise<T[]> {
  return new Promise((res, rej) => {
    const req = store.getAll();
    req.onsuccess = () => res(req.result as T[]);
    req.onerror   = () => rej(req.error);
  });
}

function del(store: IDBObjectStore, key: IDBValidKey): Promise<void> {
  return new Promise((res, rej) => {
    const req = store.delete(key);
    req.onsuccess = () => res();
    req.onerror   = () => rej(req.error);
  });
}

// ─── API pública ─────────────────────────────────────────────

export const songStorage = {

  async addSong(file: File): Promise<StoredSong> {
    const id = uid();
    const song: StoredSong = {
      id,
      fileName: file.name,
      title: file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
      artist: '',
      mimeType: file.type || 'audio/mpeg',
      size: file.size,
      duration: 0,
      analysis: null,
      performances: [],
      addedAt: Date.now(),
    };
    const db = await openDB();
    const tx = db.transaction([SONGS, AUDIO], 'readwrite');
    await Promise.all([
      put(tx.objectStore(SONGS), song),
      put(tx.objectStore(AUDIO), file, id),
    ]);
    db.close();
    return song;
  },

  async getSong(id: string): Promise<StoredSong | null> {
    const db = await openDB();
    const result = await get<StoredSong>(db.transaction(SONGS).objectStore(SONGS), id);
    db.close();
    return result ?? null;
  },

  async getAudio(id: string): Promise<Blob | null> {
    const db = await openDB();
    const result = await get<Blob>(db.transaction(AUDIO).objectStore(AUDIO), id);
    db.close();
    return result ?? null;
  },

  async listSongs(): Promise<StoredSong[]> {
    const db = await openDB();
    const list = await getAll<StoredSong>(db.transaction(SONGS).objectStore(SONGS));
    db.close();
    return list.sort((a, b) => b.addedAt - a.addedAt);
  },

  async deleteSong(id: string): Promise<void> {
    const db = await openDB();
    const tx = db.transaction([SONGS, AUDIO], 'readwrite');
    await Promise.all([
      del(tx.objectStore(SONGS), id),
      del(tx.objectStore(AUDIO), id),
    ]);
    db.close();
  },

  // Read-then-write dentro de la misma transacción para evitar auto-commit
  async updateSong(id: string, updates: Partial<Omit<StoredSong, 'id'>>): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const db = await openDB();
      const tx = db.transaction(SONGS, 'readwrite');
      const store = tx.objectStore(SONGS);
      const req = store.get(id);
      req.onsuccess = () => {
        const existing = req.result as StoredSong | undefined;
        if (!existing) { resolve(); return; }
        const pr = store.put({ ...existing, ...updates });
        pr.onsuccess = () => resolve();
        pr.onerror   = () => reject(pr.error);
      };
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => db.close();
    });
  },

  async addPerformance(id: string, perf: SongPerformance): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const db = await openDB();
      const tx = db.transaction(SONGS, 'readwrite');
      const store = tx.objectStore(SONGS);
      const req = store.get(id);
      req.onsuccess = () => {
        const existing = req.result as StoredSong | undefined;
        if (!existing) { resolve(); return; }
        const pr = store.put({ ...existing, performances: [...existing.performances, perf] });
        pr.onsuccess = () => resolve();
        pr.onerror   = () => reject(pr.error);
      };
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => db.close();
    });
  },
};
