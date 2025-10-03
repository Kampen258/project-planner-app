#!/usr/bin/env node

/**
 * Database Migration Runner
 * Run this script to update your Supabase database schema
 */

const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('🚀 Starting database schema migration...');
  
  try {
    // Read the SQL migration file
    const sql = fs.readFileSync('./update-schema.sql', 'utf8');
    
    // Split into individual statements (rough approach)
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (!statement) continue;
      
      console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        const { error } = await supabase.rpc('execute_sql', { sql_query: statement });
        
        if (error) {
          console.warn(`⚠️  Warning on statement ${i + 1}:`, error.message);
          // Continue with other statements
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      } catch (err) {
        console.warn(`⚠️  Error on statement ${i + 1}:`, err.message);
        // Continue with other statements
      }
    }
    
    console.log('🎉 Migration completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Check your Supabase dashboard to verify the changes');
    console.log('2. Update your RLS policies if needed');
    console.log('3. Test your application with the new schema');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Alternative: Manual instructions
function showManualInstructions() {
  console.log('\n📋 Manual Migration Instructions:');
  console.log('\nSince automatic migration is complex, please:');
  console.log('1. Open your Supabase dashboard');
  console.log('2. Go to the SQL Editor');
  console.log('3. Copy and paste the contents of update-schema.sql');
  console.log('4. Execute the SQL statements');
  console.log('5. Verify the changes in the Table Editor');
  console.log('\n📄 Migration file: ./update-schema.sql');
}

if (process.argv.includes('--manual')) {
  showManualInstructions();
} else {
  console.log('\n⚠️  Note: Automatic migration can be complex.');
  console.log('For safety, we recommend manual migration.');
  console.log('Run with --manual flag for instructions.\n');
  
  showManualInstructions();
}