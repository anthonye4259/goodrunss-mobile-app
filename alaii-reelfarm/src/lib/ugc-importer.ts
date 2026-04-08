// ============================================================================
// UGC CSV Auto-Importer — Runs at startup to import any UGC CSVs
// ============================================================================

import * as fs from 'fs';
import * as path from 'path';
import { saveLead, getAllLeads } from './influencer-discovery';
import type { InfluencerLead } from './manus';

const DATA_DIR = path.join(process.cwd(), 'data');
const IMPORTED_LOG = path.join(DATA_DIR, 'ugc-imported-files.json');

function getImportedFiles(): string[] {
  if (!fs.existsSync(IMPORTED_LOG)) return [];
  return JSON.parse(fs.readFileSync(IMPORTED_LOG, 'utf-8'));
}

function markFileImported(filename: string): void {
  const imported = getImportedFiles();
  imported.push(filename);
  fs.writeFileSync(IMPORTED_LOG, JSON.stringify(imported, null, 2));
}

function parseCsvLine(line: string): string[] {
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
  return values;
}

export function importUgcCsvFiles(): { imported: number; files: string[] } {
  if (!fs.existsSync(DATA_DIR)) return { imported: 0, files: [] };

  const csvFiles = fs.readdirSync(DATA_DIR).filter(f => f.startsWith('ugc_leads') && f.endsWith('.csv'));
  const alreadyImported = getImportedFiles();
  const newFiles = csvFiles.filter(f => !alreadyImported.includes(f));

  if (newFiles.length === 0) return { imported: 0, files: [] };

  let totalImported = 0;
  const existingHandles = new Set(getAllLeads().map(l => l.handle.toLowerCase()));

  for (const file of newFiles) {
    try {
      const content = fs.readFileSync(path.join(DATA_DIR, file), 'utf-8');
      const lines = content.trim().split('\n');
      if (lines.length < 2) continue;

      const headers = parseCsvLine(lines[0]);
      let fileImported = 0;

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = parseCsvLine(lines[i]);
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => { row[h] = values[idx] || ''; });

        const handle = row.instagram || row.tiktok || '';
        if (!handle || existingHandles.has(handle.toLowerCase())) continue;

        const lead: InfluencerLead = {
          handle,
          platform: row.instagram ? 'instagram' : 'tiktok',
          displayName: row.name || '',
          followers: 0,
          engagementRate: 0,
          niche: row.niche || row.niche_searched || 'beauty ugc',
          creatorType: 'ugc',
          bio: row.notes || '',
          email: row.email || undefined,
          profileUrl: row.instagram
            ? `https://instagram.com/${row.instagram.replace('@', '')}`
            : row.bio_link || '',
          discoveredAt: new Date().toISOString(),
          outreachStatus: 'new',
        };

        saveLead(lead);
        existingHandles.add(handle.toLowerCase());
        fileImported++;
      }

      markFileImported(file);
      totalImported += fileImported;
      console.log(`📥 Imported ${fileImported} UGC leads from ${file}`);
    } catch (err) {
      console.error(`❌ Failed to import ${file}:`, err);
    }
  }

  return { imported: totalImported, files: newFiles };
}
