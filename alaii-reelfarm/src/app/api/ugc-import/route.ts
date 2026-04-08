// ============================================================================
// UGC Lead Importer — Import UGC finder CSV into outreach pipeline
// ============================================================================

import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import { saveLead } from '@/lib/influencer-discovery';
import type { InfluencerLead } from '@/lib/manus';

const UGC_IMPORT_DIR = path.join(process.cwd(), 'data', 'ugc-imports');

/** GET: List imported UGC batches */
export async function GET() {
  if (!fs.existsSync(UGC_IMPORT_DIR)) {
    return NextResponse.json({ imports: [], totalImported: 0 });
  }
  const files = fs.readdirSync(UGC_IMPORT_DIR).filter(f => f.endsWith('.json'));
  const imports = files.map(f => JSON.parse(fs.readFileSync(path.join(UGC_IMPORT_DIR, f), 'utf-8')));
  return NextResponse.json({
    imports,
    totalImported: imports.reduce((sum, i) => sum + (i.imported || 0), 0),
  });
}

/** POST: Import a UGC CSV (paste the CSV content in body) */
export async function POST(request: Request) {
  const body = await request.json();

  if (!body.csv && !body.leads) {
    return NextResponse.json({ error: 'Provide "csv" (raw CSV string) or "leads" (JSON array)' }, { status: 400 });
  }

  let leads: any[] = [];

  if (body.csv) {
    // Parse CSV
    const lines = body.csv.trim().split('\n');
    const headers = lines[0].split(',').map((h: string) => h.trim());
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      
      // Handle quoted CSV fields
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      for (const char of line) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      const row: Record<string, string> = {};
      headers.forEach((h: string, idx: number) => {
        row[h] = values[idx] || '';
      });
      leads.push(row);
    }
  } else {
    leads = body.leads;
  }

  // Import into outreach system
  let imported = 0;
  let skipped = 0;
  const importedLeads: string[] = [];

  for (const lead of leads) {
    const email = lead.email?.trim();
    if (!email) {
      skipped++;
      continue;
    }

    const influencerLead: InfluencerLead = {
      handle: lead.instagram || lead.tiktok || lead.name || '',
      platform: 'instagram',
      displayName: lead.name || '',
      followers: 0,
      engagementRate: 0,
      niche: lead.niche || lead.niche_searched || 'beauty',
      creatorType: 'ugc',
      bio: lead.notes || '',
      email: email,
      profileUrl: lead.instagram
        ? `https://instagram.com/${lead.instagram.replace('@', '')}`
        : lead.bio_link || '',
      discoveredAt: new Date().toISOString(),
      outreachStatus: 'new',
    };

    saveLead(influencerLead);
    imported++;
    importedLeads.push(`${influencerLead.displayName} (${email})`);
  }

  // Save import record
  if (!fs.existsSync(UGC_IMPORT_DIR)) fs.mkdirSync(UGC_IMPORT_DIR, { recursive: true });
  const importRecord = {
    date: new Date().toISOString(),
    source: 'ugc_finder',
    totalInCsv: leads.length,
    imported,
    skipped,
    leads: importedLeads,
  };
  fs.writeFileSync(
    path.join(UGC_IMPORT_DIR, `import_${Date.now()}.json`),
    JSON.stringify(importRecord, null, 2),
  );

  return NextResponse.json({
    success: true,
    imported,
    skipped,
    message: `Imported ${imported} UGC leads with emails. ${skipped} skipped (no email). They will receive Step 1 cold emails at the next outreach run (9 AM EST).`,
    leads: importedLeads,
  });
}
