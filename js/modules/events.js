/**
 * 📡 GeoClient SP - Event Emitter System
 * @module events
 * @version 4.1.0
 * @description Lightweight pub/sub event system for module communication
 */

/**
 * EventEmitter class for inter-module communication
 */
export class EventEmitter {
  constructor(options = {}) {
    this.events = new Map();
    this.debug = options.debug || false;
    this.maxListeners = options.maxListeners || 10;
    
    if (this.debug) {
      console.log('📡 EventEmitter initialized with debug mode');
    }
  }

  /**
   * Register event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @param {Object} options - Options (once, priority)
   * @returns {Function} Unsubscribe function
   */
  on(event, callback, options = {}) {
    if (typeof callback !== 'function') {
      throw new TypeError('Callback must be a function');
    }

    if (!this.events.has(event)) {
      this.events.set(event, []);
    }

    const listeners = this.events.get(event);
    
    // Check max listeners warning
    if (listeners.length >= this.maxListeners) {
      console.warn(`⚠️ Event "${event}" has ${listeners.length} listeners. Possible memory leak?`);
    }

    const listener = {
      callback,
      once: options.once || false,
      priority: options.priority || 0
    };

    listeners.push(listener);
    
    // Sort by priority (higher first)
    listeners.sort((a, b) => b.priority - a.priority);

    if (this.debug) {
      console.log(`📡 Listener added for "${event}" (total: ${listeners.length})`);
    }

    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  /**
   * Register one-time event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  once(event, callback) {
    return this.on(event, callback, { once: true });
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function to remove
   */
  off(event, callback) {
    if (!this.events.has(event)) return;

    const listeners = this.events.get(event);
    const index = listeners.findIndex(l => l.callback === callback);
    
    if (index !== -1) {
      listeners.splice(index, 1);
      
      if (this.debug) {
        console.log(`📡 Listener removed from "${event}" (remaining: ${listeners.length})`);
      }
    }

    // Clean up empty event arrays
    if (listeners.length === 0) {
      this.events.delete(event);
    }
  }

  /**
   * Emit event to all listeners
   * @param {string} event - Event name
   * @param {*} data - Data to pass to listeners
   * @returns {boolean} True if event had listeners
   */
  emit(event, data) {
    if (!this.events.has(event)) {
      if (this.debug) {
        console.log(`📡 No listeners for "${event}"`);
      }
      return false;
    }

    const listeners = this.events.get(event).slice(); // Clone to avoid modification during iteration
    let hasError = false;

    if (this.debug) {
      console.log(`📡 Emitting "${event}" to ${listeners.length} listeners`, data);
    }

    listeners.forEach(listener => {
      try {
        listener.callback(data, event);
        
        // Remove if once
        if (listener.once) {
          this.off(event, listener.callback);
        }
      } catch (error) {
        hasError = true;
        console.error(`❌ Error in listener for "${event}":`, error);
        
        // Emit error event
        if (event !== 'error') {
          this.emit('error', { event, error, data });
        }
      }
    });

    return !hasError;
  }

  /**
   * Remove all listeners for an event
   * @param {string} event - Event name (optional, removes all if not provided)
   */
  removeAllListeners(event) {
    if (event) {
      this.events.delete(event);
      if (this.debug) {
        console.log(`📡 All listeners removed for "${event}"`);
      }
    } else {
      this.events.clear();
      if (this.debug) {
        console.log('📡 All listeners removed');
      }
    }
  }

  /**
   * Get listener count for event
   * @param {string} event - Event name
   * @returns {number} Number of listeners
   */
  listenerCount(event) {
    return this.events.has(event) ? this.events.get(event).length : 0;
  }

  /**
   * Get all event names
   * @returns {Array<string>} Array of event names
   */
  eventNames() {
    return Array.from(this.events.keys());
  }

  /**
   * Check if event has listeners
   * @param {string} event - Event name
   * @returns {boolean}
   */
  hasListeners(event) {
    return this.events.has(event) && this.events.get(event).length > 0;
  }
}

/**
 * Create a global event bus singleton
 */
let globalEventBus = null;

export function getEventBus() {
  if (!globalEventBus) {
    globalEventBus = new EventEmitter({ debug: false });
  }
  return globalEventBus;
}

/**
 * Event name constants for type safety
 */
export const EVENT_TYPES = {
  // City events
  CITY_MARKED: 'city:marked',
  CITY_REMOVED: 'city:removed',
  CITY_CLICKED: 'city:clicked',
  CITY_HOVERED: 'city:hovered',
  
  // Company events
  COMPANY_ADDED: 'company:added',
  COMPANY_REMOVED: 'company:removed',
  COMPANY_FILTER_CHANGED: 'company:filterChanged',
  
  // Client events
  CLIENT_ADDED: 'client:added',
  CLIENT_UPDATED: 'client:updated',
  CLIENT_DELETED: 'client:deleted',
  
  // Data events
  DATA_LOADED: 'data:loaded',
  DATA_SAVED: 'data:saved',
  DATA_IMPORTED: 'data:imported',
  DATA_EXPORTED: 'data:exported',
  DATA_CHANGED: 'data:changed',
  
  // Map events
  MAP_READY: 'map:ready',
  MAP_ZOOMED: 'map:zoomed',
  MAP_MOVED: 'map:moved',
  MAP_RESET: 'map:reset',
  
  // UI events
  SIDEBAR_OPENED: 'ui:sidebarOpened',
  SIDEBAR_CLOSED: 'ui:sidebarClosed',
  DASHBOARD_OPENED: 'ui:dashboardOpened',
  FILTER_APPLIED: 'ui:filterApplied',
  
  // System events
  APP_READY: 'app:ready',
  APP_ERROR: 'app:error',
  STATS_UPDATED: 'stats:updated',
  
  // Legacy compatibility
  CITY_DATA_CHANGED: 'cityDataChanged', // For existing code
  CLIENTS_DATA_UPDATED: 'clientsDataUpdated' // For existing code
};

/**
 * Helper function to create a scoped event emitter
 * @param {string} namespace - Namespace prefix for events
 * @returns {Object} Scoped emitter methods
 */
export function createScopedEmitter(namespace) {
  const bus = getEventBus();
  
  return {
    on(event, callback, options) {
      return bus.on(`${namespace}:${event}`, callback, options);
    },
    
    once(event, callback) {
      return bus.once(`${namespace}:${event}`, callback);
    },
    
    off(event, callback) {
      return bus.off(`${namespace}:${event}`, callback);
    },
    
    emit(event, data) {
      return bus.emit(`${namespace}:${event}`, data);
    }
  };
}

// Export default
export default {
  EventEmitter,
  getEventBus,
  EVENT_TYPES,
  createScopedEmitter
};
