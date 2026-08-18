import { useEffect } from 'react';

// Map e.code to character for more reliable key detection
const codeToChar = {
    'KeyA': 'a', 'KeyB': 'b', 'KeyC': 'c', 'KeyD': 'd', 'KeyE': 'e', 'KeyF': 'f',
    'KeyG': 'g', 'KeyH': 'h', 'KeyI': 'i', 'KeyJ': 'j', 'KeyK': 'k', 'KeyL': 'l',
    'KeyM': 'm', 'KeyN': 'n', 'KeyO': 'o', 'KeyP': 'p', 'KeyQ': 'q', 'KeyR': 'r',
    'KeyS': 's', 'KeyT': 't', 'KeyU': 'u', 'KeyV': 'v', 'KeyW': 'w', 'KeyX': 'x',
    'KeyY': 'y', 'KeyZ': 'z',
    'Digit0': '0', 'Digit1': '1', 'Digit2': '2', 'Digit3': '3', 'Digit4': '4',
    'Digit5': '5', 'Digit6': '6', 'Digit7': '7', 'Digit8': '8', 'Digit9': '9',
};

// Keyboard shortcut handler with proper modifier key detection
export function useKeyboardShortcuts(shortcuts) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Don't trigger shortcuts if typing in an input (except Escape, Enter, and Delete)
            const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
            if (isInput && !['Escape', 'Enter', 'Delete'].includes(e.key)) {
                return;
            }

            Object.entries(shortcuts).forEach(([key, handler]) => {
                const keys = key.toLowerCase().split('+').map(k => k.trim());

                // Extract modifiers and main key
                const hasCtrl = keys.includes('ctrl') || keys.includes('cmd');
                const hasAlt = keys.includes('alt');
                const hasShift = keys.includes('shift');
                const mainKey = keys.find(k => !['ctrl', 'cmd', 'alt', 'shift'].includes(k));

                // Check if pressed keys match the shortcut
                const isCtrlPressed = e.ctrlKey || e.metaKey;
                const isAltPressed = e.altKey;
                const isShiftPressed = e.shiftKey;

                // Special handling for special keys
                let isMainKeyPressed = false;
                if (mainKey === 'delete') {
                    isMainKeyPressed = e.key === 'Delete';
                } else if (mainKey === 'escape') {
                    isMainKeyPressed = e.key === 'Escape';
                } else if (mainKey === 'enter') {
                    isMainKeyPressed = e.key === 'Enter';
                } else if (mainKey === '?') {
                    isMainKeyPressed = e.key === '?' || e.code === 'Slash';
                } else {
                    // Try e.key first, then fall back to e.code
                    isMainKeyPressed = e.key.toLowerCase() === mainKey ||
                        (codeToChar[e.code] && codeToChar[e.code] === mainKey);
                }

                // Verify exact match: only the required modifiers are pressed
                if (
                    isCtrlPressed === hasCtrl &&
                    isAltPressed === hasAlt &&
                    isShiftPressed === hasShift &&
                    isMainKeyPressed
                ) {
                    // For browser-level shortcuts like Ctrl+N, Ctrl+W, etc., we need to preventDefault early
                    e.preventDefault();
                    e.stopPropagation();
                    handler(e);
                }
            });
        };

        // Use capture phase for better event interception
        window.addEventListener('keydown', handleKeyDown, true);
        return () => window.removeEventListener('keydown', handleKeyDown, true);
    }, [shortcuts]);
}

// Helper to format shortcuts for display
export function formatShortcut(shortcut) {
    const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
    const parts = shortcut.split('+').map(part => {
        const p = part.trim().toLowerCase();
        if (p === 'ctrl') return isMac ? '⌘' : 'Ctrl';
        if (p === 'cmd') return '⌘';
        if (p === 'alt') return isMac ? '⌥' : 'Alt';
        if (p === 'shift') return '⇧';
        if (p === 'delete') return 'Delete';
        return p.toUpperCase();
    });
    return parts.join(' + ');
}

// Common shortcuts map
export const COMMON_SHORTCUTS = {
    'ctrl+n': 'New Task',
    'escape': 'Close Modal',
    'delete': 'Delete Task',
    'enter': 'Submit Form'
};