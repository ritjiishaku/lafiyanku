"use client";

import { useState, useCallback, useEffect, useRef } from "react";

interface OfflineDraft {
  id: string;
  data: unknown;
  savedAt: string;
}

export function useOfflineDraft(storageKey: string) {
  const [draft, setDraft] = useState<OfflineDraft | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setDraft(JSON.parse(stored));
      }
    } catch {
      // ignore parse errors
    }
  }, [storageKey]);

  useEffect(() => {
    setIsOffline(!navigator.onLine);
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const saveDraft = useCallback(
    (data: unknown) => {
      const newDraft: OfflineDraft = {
        id: draft?.id ?? crypto.randomUUID(),
        data,
        savedAt: new Date().toISOString(),
      };
      try {
        localStorage.setItem(storageKey, JSON.stringify(newDraft));
        setDraft(newDraft);
        setLastSavedAt(newDraft.savedAt);
      } catch {
        // storage full or unavailable
      }
    },
    [storageKey, draft?.id],
  );

  const autoSave = useCallback(
    (data: unknown) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        saveDraft(data);
      }, 500);
    },
    [saveDraft],
  );

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setDraft(null);
      setLastSavedAt(null);
    } catch {
      // ignore
    }
  }, [storageKey]);

  return { draft, isOffline, lastSavedAt, saveDraft, autoSave, clearDraft };
}
