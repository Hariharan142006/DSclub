import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import TSP from '@/models/TSP';
import TSPSession from '@/models/TSPSession';
import Submission from '@/models/Submission';
import { verifyAdmin } from '@/lib/auth';

export async function POST(req) {
  const authError = verifyAdmin(req);
  if (authError) return authError;

  try {
    const { tspId, memberId } = await req.json();
    if (!tspId || !memberId) {
      return NextResponse.json({ error: 'Missing tspId or memberId' }, { status: 400 });
    }

    await connectToDatabase();

    const cleanMemberId = String(memberId).trim().toUpperCase();

    // 1. Find the TSP
    const tsp = await TSP.findById(tspId);
    if (!tsp) {
      return NextResponse.json({ error: 'TSP not found' }, { status: 404 });
    }

    // 2. Remove from activeParticipants
    if (Array.isArray(tsp.activeParticipants)) {
      tsp.activeParticipants = tsp.activeParticipants.filter(
        p => String(p.memberId).trim().toUpperCase() !== cleanMemberId
      );
    }

    // 3. Remove from completedMembers
    if (Array.isArray(tsp.completedMembers)) {
      tsp.completedMembers = tsp.completedMembers.filter(
        id => String(id).trim().toUpperCase() !== cleanMemberId
      );
    }

    await tsp.save();

    // 4. Delete their TSP Session
    await TSPSession.findOneAndDelete({ tspId, memberId: cleanMemberId });

    // 5. Delete their submissions for this TSP
    const deletedSubmissions = await Submission.deleteMany({ contestId: tspId, memberId: new RegExp(`^${cleanMemberId}$`, 'i') });

    return NextResponse.json({
      success: true,
      message: `Successfully rolled back ${cleanMemberId}. Deleted ${deletedSubmissions.deletedCount} submissions. They can now re-enter the TSP.`,
      tsp
    });
  } catch (error) {
    console.error('Rollback error:', error);
    return NextResponse.json({ error: 'Failed to rollback student: ' + error.message }, { status: 500 });
  }
}
