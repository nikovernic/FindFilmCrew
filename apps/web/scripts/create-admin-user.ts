#!/usr/bin/env tsx
/**
 * Script to create an admin user in Supabase
 * 
 * Usage:
 *   tsx scripts/create-admin-user.ts
 * 
 * Or with Node:
 *   npx tsx scripts/create-admin-user.ts
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

// Admin user credentials
const ADMIN_EMAIL = 'niko.vernic@gmail.com'
const ADMIN_PASSWORD = 'findfilmcrew'

async function createAdminUser() {
  console.log('🔧 Creating admin user...\n')

  // Create Supabase admin client (uses service_role key for admin operations)
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  try {
    // Step 1: Create user in Supabase Auth
    console.log(`📧 Creating auth user: ${ADMIN_EMAIL}`)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true, // Auto-confirm email so user can login immediately
    })

    if (authError) {
      if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
        console.log('⚠️  User already exists in auth.users, continuing...')
        
        // Get existing user
        const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers()
        if (listError) throw listError
        
        const existingUser = existingUsers.users.find(u => u.email === ADMIN_EMAIL)
        if (!existingUser) {
          throw new Error('User exists but could not be found')
        }
        
        authData.user = existingUser
      } else {
        throw authError
      }
    }

    if (!authData.user) {
      throw new Error('Failed to create or find user')
    }

    console.log(`✅ Auth user created/found: ${authData.user.id}\n`)

    // Step 2: Create/update user in public.users table with admin role
    console.log('👤 Setting admin role in public.users...')
    const { error: userError } = await supabaseAdmin
      .from('users')
      .upsert(
        {
          id: authData.user.id,
          email: ADMIN_EMAIL,
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

    console.log('🎉 Admin user created successfully!')
    console.log('\n📋 Login credentials:')
    console.log(`   Email: ${ADMIN_EMAIL}`)
    console.log(`   Password: ${ADMIN_PASSWORD}`)
    console.log(`\n🔗 Login at: /signin`)
    console.log(`   Admin dashboard: /admin`)

  } catch (error) {
    console.error('\n❌ Error creating admin user:')
    if (error instanceof Error) {
      console.error(`   ${error.message}`)
    } else {
      console.error(error)
    }
    process.exit(1)
  }
}

// Run the script
createAdminUser()

