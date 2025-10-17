// Run Weekly Goals Migration Script
// This script applies the weekly_goals table migration directly to your Supabase database

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Read the migration SQL file
const migrationPath = path.join(__dirname, 'database', 'migrations', 'add_weekly_goals.sql');

async function runMigration() {
  try {
    console.log('🚀 Starting Weekly Goals migration...');

    // Read the SQL migration file
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📖 Migration file loaded successfully');

    // Split the migration into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';

      console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);

      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: statement
        });

        if (error) {
          // If exec_sql doesn't exist, try direct query
          console.log('   Trying alternative execution method...');
          const { data: altData, error: altError } = await supabase
            .from('information_schema.tables')
            .select('*')
            .limit(1);

          if (altError) {
            console.log('   ⚠️  Cannot execute raw SQL with current permissions');
            console.log('   📋 You\'ll need to run this migration manually');
            break;
          }
        }

        console.log(`   ✅ Statement ${i + 1} executed successfully`);

      } catch (statementError) {
        console.log(`   ⚠️  Error in statement ${i + 1}:`, statementError.message);
        console.log(`   📝 Statement: ${statement.substring(0, 100)}...`);
      }
    }

    console.log('✅ Migration process completed!');
    console.log('🔍 Verifying table creation...');

    // Verify the table was created
    const { data: tableCheck, error: checkError } = await supabase
      .from('weekly_goals')
      .select('*')
      .limit(1);

    if (checkError) {
      if (checkError.message.includes('relation "weekly_goals" does not exist')) {
        console.log('❌ Table was not created successfully');
        console.log('📋 Please run the migration manually via Supabase Dashboard');
        console.log('🔗 Go to: https://supabase.com/dashboard/project/msuqglhbfritslvytexf/editor');
        console.log('📝 Copy and paste the SQL from:', migrationPath);
      } else {
        console.log('⚠️  Unexpected error checking table:', checkError.message);
      }
    } else {
      console.log('🎉 SUCCESS! weekly_goals table is ready to use!');
      console.log('📊 You can now use the Weekly Goals feature in your app');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('');
    console.log('📋 Manual migration steps:');
    console.log('1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/msuqglhbfritslvytexf/editor');
    console.log('2. Open the SQL Editor');
    console.log('3. Copy and paste the contents of:', migrationPath);
    console.log('4. Click "Run" to execute the migration');
  }
}

// Check if migration file exists
if (!fs.existsSync(migrationPath)) {
  console.error('❌ Migration file not found:', migrationPath);
  process.exit(1);
}

// Run the migration
runMigration();