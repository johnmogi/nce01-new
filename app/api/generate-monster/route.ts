import { NextResponse } from 'next/server';
import { generateElementalMonster } from '../../../src/engine';

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));
  return NextResponse.json(generateElementalMonster(payload));
}
