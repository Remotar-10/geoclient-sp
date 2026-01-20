/**
 * 🧭 GeoClient SP - Navigation Manager
 * @module navigation-manager
 * @version 4.1.0
 * @description Sidebar and tab navigation management
 */

import { getEventBus, EVENT_TYPES } from './events.js';
import { storage } from './utils.js';

/**
 * NavigationManager class for sidebar and tabs
 */
export class NavigationManager {
  constructor(options = {}) {
    this.sidebarEl = options.sidebarEl || null;
    this.currentTab = options.defaultTab || 'map';
    this.eventBus = getEventBus();
    this.tabs = {};
    this.menuItems = {};
    this.isCollapsed = storage.get('sidebar-collapsed', false);
    
    console.log('🧭 NavigationManager initialized');
  }

  /**
   * Register a tab
   * @param {string} id - Tab ID
   * @param {Object} config - Tab configuration
   */
  registerTab(id, config) {
    this.tabs[id] = {
      id,
      label: config.label,
      icon: config.icon,
      contentEl: config.contentEl,
      onActivate: config.onActivate,
      onDeactivate: config.onDeactivate,
      enabled: config.enabled !== false
    };

    console.log(`🧭 Tab registered: ${id}`);
  }

  /**
   * Register a menu item
   * @param {string} id - Menu item ID
   * @param {Object} config - Menu configuration
   */
  registerMenuItem(id, config) {
    this.menuItems[id] = {
      id,
      label: config.label,
      icon: config.icon,
      action: config.action,
      enabled: config.enabled !== false,
      badge: config.badge || null
    };

    console.log(`🧭 Menu item registered: ${id}`);
  }

  /**
   * Navigate to tab
   * @param {string} tabId - Tab ID
   */
  navigateTo(tabId) {
    if (!this.tabs[tabId]) {
      console.warn(`⚠️ Tab not found: ${tabId}`);
      return;
    }

    if (!this.tabs[tabId].enabled) {
      console.warn(`⚠️ Tab disabled: ${tabId}`);
      return;
    }

    // Deactivate current tab
    if (this.currentTab && this.tabs[this.currentTab]) {
      const currentTabConfig = this.tabs[this.currentTab];
      if (currentTabConfig.onDeactivate) {
        currentTabConfig.onDeactivate();
      }
    }

    // Activate new tab
    this.currentTab = tabId;
    const newTabConfig = this.tabs[tabId];
    
    if (newTabConfig.onActivate) {
      newTabConfig.onActivate();
    }

    // Emit event
    this.eventBus.emit(EVENT_TYPES.TAB_CHANGED, { tab: tabId });
    
    console.log(`🧭 Navigated to: ${tabId}`);
  }

  /**
   * Get current tab
   * @returns {string} Current tab ID
   */
  getCurrentTab() {
    return this.currentTab;
  }

  /**
   * Toggle sidebar collapse
   */
  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    storage.set('sidebar-collapsed', this.isCollapsed);
    
    this.eventBus.emit(EVENT_TYPES.SIDEBAR_TOGGLED, { collapsed: this.isCollapsed });
    
    console.log(`🧭 Sidebar ${this.isCollapsed ? 'collapsed' : 'expanded'}`);
  }

  /**
   * Show sidebar
   */
  showSidebar() {
    if (this.isCollapsed) {
      this.toggleSidebar();
    }
  }

  /**
   * Hide sidebar
   */
  hideSidebar() {
    if (!this.isCollapsed) {
      this.toggleSidebar();
    }
  }

  /**
   * Set menu item badge
   * @param {string} itemId - Menu item ID
   * @param {string|number} badge - Badge value
   */
  setMenuBadge(itemId, badge) {
    if (this.menuItems[itemId]) {
      this.menuItems[itemId].badge = badge;
      this.eventBus.emit(EVENT_TYPES.MENU_UPDATED, { item: itemId, badge });
    }
  }

  /**
   * Enable/disable tab
   * @param {string} tabId - Tab ID
   * @param {boolean} enabled - Enable state
   */
  setTabEnabled(tabId, enabled) {
    if (this.tabs[tabId]) {
      this.tabs[tabId].enabled = enabled;
      
      if (!enabled && this.currentTab === tabId) {
        // Navigate to first enabled tab
        const firstEnabled = Object.values(this.tabs).find(tab => tab.enabled);
        if (firstEnabled) {
          this.navigateTo(firstEnabled.id);
        }
      }
    }
  }

  /**
   * Enable/disable menu item
   * @param {string} itemId - Menu item ID
   * @param {boolean} enabled - Enable state
   */
  setMenuItemEnabled(itemId, enabled) {
    if (this.menuItems[itemId]) {
      this.menuItems[itemId].enabled = enabled;
      this.eventBus.emit(EVENT_TYPES.MENU_UPDATED, { item: itemId, enabled });
    }
  }

  /**
   * Get all tabs
   * @returns {Object} Tabs object
   */
  getTabs() {
    return { ...this.tabs };
  }

  /**
   * Get all menu items
   * @returns {Object} Menu items object
   */
  getMenuItems() {
    return { ...this.menuItems };
  }

  /**
   * Setup keyboard shortcuts
   */
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + B: Toggle sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        this.toggleSidebar();
      }

      // Ctrl/Cmd + 1-9: Switch tabs
      if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        const tabIndex = parseInt(e.key) - 1;
        const tabs = Object.keys(this.tabs);
        if (tabs[tabIndex]) {
          this.navigateTo(tabs[tabIndex]);
        }
      }
    });

    console.log('🧭 Keyboard shortcuts enabled');
  }
}

// Export singleton instance
let navigationManagerInstance = null;

export function getNavigationManager() {
  if (!navigationManagerInstance) {
    navigationManagerInstance = new NavigationManager();
  }
  return navigationManagerInstance;
}

export default {
  NavigationManager,
  getNavigationManager
};
