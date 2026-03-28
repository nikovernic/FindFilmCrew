import { createClient } from '/Users/nikovernic/Desktop/VC Projects/crew-up/node_modules/.pnpm/@supabase+supabase-js@2.98.0/node_modules/@supabase/supabase-js/dist/index.mjs';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { parse } from '/Users/nikovernic/Desktop/VC Projects/crew-up/node_modules/.pnpm/csv-parse@6.2.1/node_modules/csv-parse/dist/esm/sync.js';

const supabase = createClient(
  'https://bjnfxzznblopuccuthpb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqbmZ4enpuYmxvcHVjY3V0aHBiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTI4ODU5OSwiZXhwIjoyMDg0ODY0NTk5fQ.w4GzfrVZ8efRoPWJRIaYk3fT2Pf0uxj_RPakb22ukCA'
);

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80);
}

async function run() {
  // 1. Get all existing profile names
  console.log('Fetching existing profiles...');
  let allExisting = [];
  let offset = 0;
  while (true) {
    const { data, error } = await supabase
      .from('profiles')
      .select('name, slug')
      .range(offset, offset + 999);
    if (error) { console.error('Error fetching:', error); return; }
    allExisting = allExisting.concat(data);
    if (data.length < 1000) break;
    offset += 1000;
  }

  const existingNames = new Set(allExisting.map(p => p.name.toLowerCase().trim()));
  const existingSlugs = new Set(allExisting.map(p => p.slug));
  console.log(`Found ${allExisting.length} existing profiles`);

  // 2. Read all crewup CSVs
  const dir = '/Users/nikovernic/texas-gaffer-scraper/output/';
  const files = readdirSync(dir).filter(f => f.endsWith('_crewup.csv'));

  let toUpload = [];
  let dupes = 0;
  let noContact = 0;

  for (const file of files) {
    const content = readFileSync(join(dir, file), 'utf8');
    const rows = parse(content, { columns: true, skip_empty_lines: true, relax_quotes: true, relax_column_count: true });

    for (const row of rows) {
      const name = (row.name || '').trim();
      const email = (row.contact_email || '').trim();
      const phone = (row.contact_phone || '').trim();

      if (!name || name.length < 2) continue;
      if (!email && !phone) { noContact++; continue; }
      if (existingNames.has(name.toLowerCase())) { dupes++; continue; }

      // Generate unique slug
      let slug = generateSlug(name);
      let slugSuffix = 2;
      while (existingSlugs.has(slug)) {
        slug = generateSlug(name) + '-' + slugSuffix;
        slugSuffix++;
      }
      existingSlugs.add(slug);
      existingNames.add(name.toLowerCase());

      toUpload.push({
        name,
        slug,
        primary_role: (row.primary_role || '').trim() || null,
        primary_location_city: (row.primary_location_city || '').trim() || null,
        primary_location_state: (row.primary_location_state || '').trim() || null,
        contact_email: email || null,
        contact_phone: phone || null,
        bio: (row.bio || '').trim() || null,
        website: (row.website || '').trim() || null,
        instagram_url: (row.instagram_url || '').trim() || null,
        union_status: (row.union_status || '').trim() || null,
        photo_url: (row.photo_url || '').trim() || null,
        secondary_roles: (row.secondary_roles || '').trim()
          ? (row.secondary_roles || '').trim().split(',').map(r => r.trim()).filter(Boolean)
          : null,
      });
    }
  }

  console.log(`\nSkipped (no contact info): ${noContact}`);
  console.log(`Skipped (already in DB): ${dupes}`);
  console.log(`Ready to upload: ${toUpload.length}`);

  if (toUpload.length === 0) {
    console.log('Nothing to upload!');
    return;
  }

  // Show samples
  console.log('\nSample entries:');
  for (const p of toUpload.slice(0, 5)) {
    console.log(`  ${p.name} | ${p.primary_role} | ${p.contact_email || p.contact_phone}`);
  }

  // 3. Upload in batches of 50
  console.log(`\nUploading ${toUpload.length} profiles...`);
  let uploaded = 0;
  let errors = 0;

  for (let i = 0; i < toUpload.length; i += 50) {
    const batch = toUpload.slice(i, i + 50);
    const { error } = await supabase.from('profiles').insert(batch);
    if (error) {
      console.error(`Batch ${i}-${i + batch.length} error:`, error.message);
      for (const profile of batch) {
        const { error: singleErr } = await supabase.from('profiles').insert(profile);
        if (singleErr) {
          console.error(`  Failed: ${profile.name} - ${singleErr.message}`);
          errors++;
        } else {
          uploaded++;
        }
      }
    } else {
      uploaded += batch.length;
      process.stdout.write(`  ${uploaded}/${toUpload.length}\r`);
    }
  }

  console.log(`\nDone! Uploaded: ${uploaded}, Errors: ${errors}`);
}

run();
