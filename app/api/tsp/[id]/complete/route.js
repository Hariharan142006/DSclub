import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import TSP from '@/models/TSP';
import TSPSession from '@/models/TSPSession';
import Submission from '@/models/Submission';
import { safeString } from '@/lib/apiHelpers';

export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { memberId, name } = body;

    if (!memberId) {
      return NextResponse.json({ error: 'Missing memberId' }, { status: 400 });
    }

    await connectToDatabase();
    const tsp = await TSP.findById(id);
    if (!tsp) {
      return NextResponse.json({ error: 'TSP arena not found' }, { status: 404 });
    }

    const cleanMemberId = safeString(memberId).trim().toUpperCase();

    // 1. Mark in completedMembers
    if (!Array.isArray(tsp.completedMembers)) {
      tsp.completedMembers = [];
    }
    if (!tsp.completedMembers.includes(cleanMemberId)) {
      tsp.completedMembers.push(cleanMemberId);
    }

    // 2. Fetch or update TSPSession
    const session = await TSPSession.findOne({ tspId: id, memberId: cleanMemberId });
    let sessionScore = 0;
    if (session) {
      session.completed = true;
      session.completedAt = session.completedAt || new Date();
      session.status = 'completed';
      sessionScore = session.score || 0;
      await session.save();
    } else {
      // Calculate score from any existing submissions
      try {
        const subs = await Submission.find({ contestId: id, memberId: { $regex: new RegExp(`^${cleanMemberId}$`, 'i') } });
        subs.forEach(s => {
          sessionScore += (s.quizScore || 0);
        });
      } catch (e) {}
    }

    // 3. Update activeParticipants
    if (!Array.isArray(tsp.activeParticipants)) {
      tsp.activeParticipants = [];
    }
    const participantIndex = tsp.activeParticipants.findIndex(
      p => p && p.memberId && String(p.memberId).trim().toUpperCase() === cleanMemberId
    );

    if (participantIndex !== -1) {
      tsp.activeParticipants[participantIndex].status = 'completed';
      tsp.activeParticipants[participantIndex].completedAt = new Date();
      if (sessionScore > 0) {
        tsp.activeParticipants[participantIndex].score = sessionScore;
      }
    } else {
      tsp.activeParticipants.push({
        memberId: cleanMemberId,
        name: name || cleanMemberId,
        joinedAt: new Date(),
        score: sessionScore,
        status: 'completed',
        completedAt: new Date(),
      });
    }

    await tsp.save();

    return NextResponse.json({
      success: true,
      message: 'TSP arena session completed and exited successfully'
    });
  } catch (error) {
    console.error('Error completing TSP arena session:', error);
    return NextResponse.json({ error: 'Failed to complete TSP session: ' + error.message }, { status: 500 });
  }
}
