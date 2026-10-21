import { NextResponse } from 'next/server';
import { generateTrap } from '../../../src/engine';

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));
  try { return NextResponse.json(generateTrap(payload)); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to generate trap' }, { status: 400 }); }
}
