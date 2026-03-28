#!/usr/bin/env tsx
/**
 * Script to update an existing user's role to admin
 * 
 * Usage:
 *   tsx scripts/update-user-role.ts <email>
 * 
 * Or with Node:
 *   npx tsx scripts/update-user-role.ts <email>
 * 
 * Requires:
 *   - NEXT_PUBLIC_SUPABASE_URL in .env.local
 *   - SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Load environment variables from .env.local
const envPath = resolve(process.cwd(), '.env.local')
try {
  const envFile = readFileSync(envPath, 'utf-8')
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const value = match[2].trim().replace(/^["']|["']$/g, '')
      if (!process.env[key]) {
        process.env[key] = value
      }
    }
  })
} catch (error) {
  console.warn('⚠️  Could not load .env.local file, using existing environment variables')
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  console.error('\nPlease ensure these are set in .env.local')
  process.exit(1)
}

const email = process.argv[2] || 'niko.vernic@gmail.com'

async function updateUserRole() {
  console.log(`🔧 Updating user role to admin for: ${email}\n`)

  // Create Supabase admin client (uses service_role key for admin operations)
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  try {
    // Step 1: Find user in auth.users
    console.log(`📧 Finding auth user: ${email}`)
    const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (listError) {
      throw listError
    }
    
    const authUser = usersData.users.find(u => u.email === email)
    
    if (!authUser) {
      console.error(`❌ User with email ${email} not found in auth.users`)
      console.error('   Please create the user first or check the email address')
      process.exit(1)
    }

    console.log(`✅ Found auth user: ${authUser.id}\n`)

    // Step 2: Update/create user in public.users table with admin role
    console.log('👤 Setting admin role in public.users...')
    const { error: userError } = await supabaseAdmin
      .from('users')
      .upsert(
        {
          id: authUser.id,
          email: email,
          role: 'admin',
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'id',
        }
      )

    if (userError) {
      throw userError
    }

    console.log('✅ Admin role set successfully!\n')

    console.log('🎉 User role updated successfully!')
    console.log(`\n📋 User details:`)
    console.log(`   Email: ${email}`)
    console.log(`   Role: admin`)
    console.log(`\n🔗 You can now access: /admin`)

  } catch (error) {
    console.error('\n❌ Error updating user role:')
    if (error instanceof Error) {
      console.error(`   ${error.message}`)
    } else {
      console.error(error)
    }
    process.exit(1)
  }
}

// Run the script
updateUserRole()

