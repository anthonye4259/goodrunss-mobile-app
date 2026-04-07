// TikTok Accounts API
import { NextRequest, NextResponse } from 'next/server';
import { getAllAccounts, removeAccount, saveAccount } from '@/lib/tiktok';

export async function GET() {
  const accounts = getAllAccounts();
  return NextResponse.json({ accounts });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (body.account) {
    saveAccount(body.account);
    return NextResponse.json({ success: true, id: body.account.id });
  }
  return NextResponse.json({ error: 'Missing account data' }, { status: 400 });
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: 'Missing account ID' }, { status: 400 });
  }
  removeAccount(id);
  return NextResponse.json({ success: true });
}
