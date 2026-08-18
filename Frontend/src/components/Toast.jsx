import { TOAST_TYPES } from '../hooks/useToast';
import './Toast.css';

export default function Toast({ toasts, removeToast }) {
    if (toasts.length === 0) return null;

    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`toast toast-${toast.type}`}
                    role="alert"
                    aria-live="polite"
                    aria-atomic="true"
                >
                    <div className="toast-content">
                        <span className="toast-icon">
                            {toast.type === TOAST_TYPES.SUCCESS && '✓'}
                            {toast.type === TOAST_TYPES.ERROR && '✕'}
                            {toast.type === TOAST_TYPES.INFO && 'ℹ'}
                            {toast.type === TOAST_TYPES.WARNING && '⚠'}
                        </span>
                        <span className="toast-message">{toast.message}</span>
                    </div>
                    <button
                        className="toast-close"
                        onClick={() => removeToast(toast.id)}
                        aria-label="Close notification"
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
}
