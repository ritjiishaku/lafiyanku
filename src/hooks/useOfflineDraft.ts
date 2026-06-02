"use client";

import { useState, useCallback, useEffect } from "react";

interface OfflineDraft {
  id: string;
  data: unknown;
  savedAt: string;
}

export function useOfflineDraft(storageKey: string) {
  const [draft, setDraft] = useState<OfflineDraft | null>(null);

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

  const saveDraft = useCallback(
    (data: unknown) => {
      const newDraft: OfflineDraft = {
        id: crypto.randomUUID(),
        data,
        savedAt: new Date().toISOString(),
      };
      try {
        localStorage.setItem(storageKey, JSON.stringify(newDraft));
        setDraft(newDraft);
      } catch {
        // storage full or unavailable
      }
    },
    [storageKey],
  );

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setDraft(null);
    } catch {
      // ignore
    }
  }, [storageKey]);

  return { draft, saveDraft, clearDraft };
}
