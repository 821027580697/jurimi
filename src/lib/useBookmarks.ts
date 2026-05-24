'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'jurimi-bookmarks';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setBookmarks(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  const toggle = useCallback((code: string) => {
    setBookmarks(prev => {
      const next = prev.includes(code)
        ? prev.filter(c => c !== code)
        : [...prev, code];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const isBookmarked = useCallback((code: string) => {
    return bookmarks.includes(code);
  }, [bookmarks]);

  return { bookmarks, toggle, isBookmarked };
}
