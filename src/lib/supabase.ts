// Legacy compatibility wrapper for the enhanced Supabase client
// This file maintains backward compatibility while using the new enhanced client

// Re-export everything from the enhanced client
export * from './supabase.client';

// Import the main client as the default export for backward compatibility
import { supabase as enhancedSupabase } from './supabase.client';

// Export as the legacy name for existing imports
export const supabase = enhancedSupabase;

// Also export as default for ES6 imports
export default enhancedSupabase;