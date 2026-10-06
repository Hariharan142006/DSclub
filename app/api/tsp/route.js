import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import TSP from '@/models/TSP';
import { verifyAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await connectToDatabase();
    const tsps = await TSP.find().sort({ createdAt: -1 }).lean();
    
    // Deduplicate activeParticipants to prevent double-counting bugs
    tsps.forEach(tsp => {
      if (tsp.activeParticipants && Array.isArray(tsp.activeParticipants)) {
        const seen = new Set();
        const unique = [];
        // Iterate backwards to keep the latest attempt
        for (let i = tsp.activeParticipants.length - 1; i >= 0; i--) {
          const p = tsp.activeParticipants[i];
          const mid = (p.memberId || '').trim().toUpperCase();
          if (mid && !seen.has(mid)) {
            seen.add(mid);
            unique.unshift(p);
          }
        }
        tsp.activeParticipants = unique;
      }
    });

    return NextResponse.json(tsps);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  const authError = verifyAdmin(req);
  if (authError) return authError;

  try {
    await connectToDatabase();
    const data = await req.json();
    if (!data.title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    const tsp = await TSP.create(data);
    return NextResponse.json(tsp, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
