/**
 * POST /api/log: errors from the phone, written to the server log (Railway).
 * Find one with: railway logs | grep E-7K2F
 */
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const text = await request.text();
    if (text.length > 10_000) return NextResponse.json({ ok: false }, { status: 413 });
    const report = JSON.parse(text);
    console.error(JSON.stringify({ level: 'error', source: 'client', ...report }));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
