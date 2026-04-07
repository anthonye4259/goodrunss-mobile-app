// TikTok Accounts API
import { NextRequest, NextResponse } from 'next/server';
import { getAllAccounts, removeAccount } from '@/lib/tiktok';

export async function GET() {
  const accounts = getAllAccounts();
  return NextResponse.json({ accounts });
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: 'Missing account ID' }, { status: 400 });
  }
  removeAccount(id);
  return NextResponse.json({ success: true });
}
