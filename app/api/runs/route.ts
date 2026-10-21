import { NextResponse } from 'next/server';
import { createRun } from '../../../src/engine';
import { runStore } from './store';

type RunPayload = {
  seed?: number;
  character?: { name: string; class: string; element: string };
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as RunPayload;
    const run = createRun({
      seed: payload.seed ?? 1001,
      character: payload.character ?? { name: 'Aeris', class: 'warrior', element: 'air' }
    });
    runStore.set(run.id, run);
    return NextResponse.json(run, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to create run' }, { status: 400 });
  }
}
