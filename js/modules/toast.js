/**
 * 🍔 GeoClient SP - Toast Notification System
 * @module toast
 * @version 4.1.0
 * @description Lightweight toast notification system
 */

import { TOAST_TYPES, TIMING } from './config.js';

// 🎨 Toast container (created once)
let toastContainer = null;

// 📋 Toast queue
const toastQueue = [];
let isShowingToast = false;

/**
 * Initialize toast container
 */
function initToastContainer() {
  if (toastContainer) return;

  toastContainer = document.createElement('div');
  toastContainer.id = 'toast-container';
  toastContainer.className = 'toast-container';
  
  // Add styles if not already present
  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      .toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none;
      }

      .toast {
        background: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 280px;
        max-width: 400px;
        pointer-events: auto;
        animation: toastSlideIn 0.3s ease;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 14px;
      }

      .toast.removing {
        animation: toastSlideOut 0.3s ease forwards;
      }

      @keyframes toastSlideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes toastSlideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }

      .toast-icon {
        font-size: 20px;
        line-height: 1;
        flex-shrink: 0;
      }

      .toast-message {
        flex: 1;
        color: #1f2937;
        line-height: 1.4;
      }

      .toast-close {
        background: none;
        border: none;
        color: #6b7280;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: background 0.2s;
        flex-shrink: 0;
      }

      .toast-close:hover {
        background: rgba(0, 0, 0, 0.05);
      }

      .toast.success {
        border-left: 4px solid #10b981;
      }

      .toast.error {
        border-left: 4px solid #ef4444;
      }

      .toast.warning {
        border-left: 4px solid #f59e0b;
      }

      .toast.info {
        border-left: 4px solid #3b82f6;
      }

      @media (max-width: 480px) {
        .toast-container {
          top: 10px;
          right: 10px;
          left: 10px;
        }

        .toast {
          min-width: unset;
          max-width: unset;
        }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(toastContainer);
}

/**
 * Get icon for toast type
 * @param {string} type - Toast type
 * @returns {string} Icon emoji
 */
function getToastIcon(type) {
  const icons = {
    [TOAST_TYPES.SUCCESS]: '✅',
    [TOAST_TYPES.ERROR]: '❌',
    [TOAST_TYPES.WARNING]: '⚠️',
    [TOAST_TYPES.INFO]: 'ℹ️'
  };
  return icons[type] || 'ℹ️';
}

/**
 * Create toast element
 * @param {string} message - Toast message
 * @param {string} type - Toast type
 * @returns {HTMLElement} Toast element
 */
function createToastElement(message, type) {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');

  const icon = document.createElement('span');
  icon.className = 'toast-icon';
  icon.textContent = getToastIcon(type);

  const messageEl = document.createElement('span');
  messageEl.className = 'toast-message';
  messageEl.textContent = message;

  const closeBtn = document.createElement('button');
  closeBtn.className = 'toast-close';
  closeBtn.innerHTML = '×';
  closeBtn.setAttribute('aria-label', 'Fechar');
  closeBtn.onclick = () => removeToast(toast);

  toast.appendChild(icon);
  toast.appendChild(messageEl);
  toast.appendChild(closeBtn);

  return toast;
}

/**
 * Remove toast from DOM
 * @param {HTMLElement} toast - Toast element
 */
function removeToast(toast) {
  toast.classList.add('removing');
  setTimeout(() => {
    if (toast.parentElement) {
      toast.parentElement.removeChild(toast);
    }
    isShowingToast = false;
    processToastQueue();
  }, 300); // Animation duration
}

/**
 * Process toast queue
 */
function processToastQueue() {
  if (isShowingToast || toastQueue.length === 0) return;

  const { message, type, duration } = toastQueue.shift();
  isShowingToast = true;

  const toast = createToastElement(message, type);
  toastContainer.appendChild(toast);

  // Auto-remove after duration
  setTimeout(() => {
    removeToast(toast);
  }, duration);
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Toast type (success, error, warning, info)
 * @param {number} duration - Duration in milliseconds (default: 3000)
 */
export function showToast(message, type = TOAST_TYPES.INFO, duration = TIMING.toastDuration) {
  // Initialize container on first use
  if (!toastContainer) {
    initToastContainer();
  }

  // Validate type
  if (!Object.values(TOAST_TYPES).includes(type)) {
    console.warn(`Invalid toast type: ${type}. Using INFO.`);
    type = TOAST_TYPES.INFO;
  }

  // Add to queue
  toastQueue.push({ message, type, duration });

  // Process queue
  processToastQueue();
}

/**
 * Shorthand methods for each toast type
 */
export const toast = {
  success(message, duration) {
    showToast(message, TOAST_TYPES.SUCCESS, duration);
  },
  
  error(message, duration) {
    showToast(message, TOAST_TYPES.ERROR, duration);
  },
  
  warning(message, duration) {
    showToast(message, TOAST_TYPES.WARNING, duration);
  },
  
  info(message, duration) {
    showToast(message, TOAST_TYPES.INFO, duration);
  }
};

/**
 * Clear all toasts
 */
export function clearAllToasts() {
  if (!toastContainer) return;
  
  const toasts = toastContainer.querySelectorAll('.toast');
  toasts.forEach(toast => removeToast(toast));
  toastQueue.length = 0;
}

// Export default
export default {
  show: showToast,
  success: toast.success,
  error: toast.error,
  warning: toast.warning,
  info: toast.info,
  clear: clearAllToasts
};
