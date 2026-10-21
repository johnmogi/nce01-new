import { NextResponse } from 'next/server';
import { generateItem } from '../../../src/engine';

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));
  try { return NextResponse.json(generateItem(payload)); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to generate item' }, { status: 400 }); }
}
