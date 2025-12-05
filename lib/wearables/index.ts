/**
 * Wearables Module
 * 
 * Exports all wearable integrations and utilities
 */

// Types
export * from './types'

// Services
export { appleHealthService, AppleHealthService, HEALTHKIT_PERMISSIONS } from './apple-health'
export { whoopService, WhoopService, WHOOP_SCOPES } from './whoop'
export { ouraService, OuraService, OURA_SCOPES } from './oura'

// Manager
export { wearablesManager, WearablesManager } from './manager'

// Default export
export { wearablesManager as default } from './manager'








