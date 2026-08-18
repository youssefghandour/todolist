import { useState } from 'react';
import { formatShortcut, COMMON_SHORTCUTS } from '../hooks/useKeyboardShortcuts';
import './KeyboardShortcutsHelp.css';

export default function KeyboardShortcutsHelp() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Help button */}
            <button
                className="shortcuts-help-btn"
                onClick={() => setIsOpen(true)}
                title="View keyboard shortcuts (press ? or Ctrl+?)"
                aria-label="Keyboard shortcuts help"
            >
                ?
            </button>

            {/* Modal */}
            {isOpen && (
                <div className="shortcuts-modal-overlay" onClick={() => setIsOpen(false)}>
                    <div className="shortcuts-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="shortcuts-modal-header">
                            <h3>Keyboard Shortcuts</h3>
                            <button
                                className="shortcuts-modal-close"
                                onClick={() => setIsOpen(false)}
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>

                        <div className="shortcuts-list">
                            {Object.entries(COMMON_SHORTCUTS).map(([key, description]) => (
                                <div key={key} className="shortcut-item">
                                    <kbd className="shortcut-key">{formatShortcut(key)}</kbd>
                                    <span className="shortcut-description">{description}</span>
                                </div>
                            ))}
                        </div>

                        <div className="shortcuts-footer">
                            <small>Press <kbd>Escape</kbd> to close this dialog</small>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
