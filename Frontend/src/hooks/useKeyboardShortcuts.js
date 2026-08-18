import { useEffect } from 'react';

// Keyboard shortcut handler
export function useKeyboardShortcuts(shortcuts) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Don't trigger shortcuts if typing in an input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                // Allow some shortcuts even in inputs
                if (!['Enter', 'Escape'].includes(e.key)) {
                    return;
                }
            }

            Object.entries(shortcuts).forEach(([key, handler]) => {
                const [keyCombination, action] = key.split(':');
                const keys = keyCombination.split('+').map(k => k.trim().toLowerCase());

                const ctrl = keys.includes('ctrl') || keys.includes('cmd');
                const alt = keys.includes('alt');
                const shift = keys.includes('shift');
                const mainKey = keys[keys.length - 1];

                const isCtrlPressed = (e.ctrlKey || e.metaKey) === ctrl;
                const isAltPressed = e.altKey === alt;
                const isShiftPressed = e.shiftKey === shift;
                const isMainKeyPressed = e.key.toLowerCase() === mainKey;

                if (isCtrlPressed && isAltPressed && isShiftPressed && isMainKeyPressed) {
                    e.preventDefault();
                    handler(e);
                }
            });
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts]);
}

// Helper to format shortcuts for display
export function formatShortcut(shortcut) {
    const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
    return shortcut
        .replace('ctrl', isMac ? '⌘' : 'Ctrl')
        .replace('+', ' + ')
        .toUpperCase();
}

// Common shortcuts map
export const COMMON_SHORTCUTS = {
    'ctrl+n': 'New Task',
    'ctrl+f': 'Search',
    'ctrl+k': 'Focus Search',
    'escape': 'Close Modal',
    'enter': 'Submit',
    'delete': 'Delete Item'
};
