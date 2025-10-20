import { useEffect } from 'react';

export interface KeyboardShortcutOptions {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  preventDefault?: boolean;
}

/**
 * Cross-platform keyboard shortcut hook
 * Automatically handles Cmd on Mac and Ctrl on Windows/Linux
 *
 * @example
 * // Cmd+K on Mac, Ctrl+K on Windows/Linux
 * useKeyboardShortcut({ key: 'k', metaKey: true }, () => {
 *   console.log('Command palette opened!');
 * });
 */
export function useKeyboardShortcut(
  shortcut: KeyboardShortcutOptions,
  callback: (event: KeyboardEvent) => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = typeof window !== 'undefined' && navigator.platform.toLowerCase().includes('mac');

      // Normalize key comparison (case-insensitive)
      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();

      // Check modifier keys
      const ctrlMatches = shortcut.ctrlKey === undefined || event.ctrlKey === shortcut.ctrlKey;
      const shiftMatches = shortcut.shiftKey === undefined || event.shiftKey === shortcut.shiftKey;
      const altMatches = shortcut.altKey === undefined || event.altKey === shortcut.altKey;

      // Handle metaKey (Cmd on Mac, Ctrl on Windows/Linux)
      let metaMatches = true;
      if (shortcut.metaKey !== undefined) {
        if (isMac) {
          metaMatches = event.metaKey === shortcut.metaKey;
        } else {
          // On Windows/Linux, treat metaKey as ctrlKey
          metaMatches = event.ctrlKey === shortcut.metaKey;
        }
      }

      if (keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches) {
        if (shortcut.preventDefault !== false) {
          event.preventDefault();
        }
        callback(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcut, callback, enabled]);
}

/**
 * Get the display string for a keyboard shortcut
 * Returns platform-specific modifier symbols
 */
export function getShortcutDisplay(shortcut: KeyboardShortcutOptions): string {
  const isMac = typeof window !== 'undefined' && navigator.platform.toLowerCase().includes('mac');
  const parts: string[] = [];

  if (shortcut.metaKey) {
    parts.push(isMac ? '⌘' : 'Ctrl');
  }
  if (shortcut.ctrlKey) {
    parts.push(isMac ? '⌃' : 'Ctrl');
  }
  if (shortcut.altKey) {
    parts.push(isMac ? '⌥' : 'Alt');
  }
  if (shortcut.shiftKey) {
    parts.push(isMac ? '⇧' : 'Shift');
  }

  parts.push(shortcut.key.toUpperCase());

  return parts.join(isMac ? '' : '+');
}
