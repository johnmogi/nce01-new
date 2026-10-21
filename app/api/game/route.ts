import { NextResponse } from 'next/server';
import { enterRoom, resolveRoom } from '../../../src/engine';
import { runStore } from '../runs/store';

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));
  const run = runStore.get(payload.runId);
  if (!run) return NextResponse.json({ error: 'run not found' }, { status: 404 });
  try {
    const result = payload.action === 'resolve'
      ? resolveRoom(run, Number(payload.row), Number(payload.column), payload)
      : enterRoom(run, Number(payload.row), Number(payload.column));
    return NextResponse.json({ run, room: result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to process game action' }, { status: 400 });
  }
}
