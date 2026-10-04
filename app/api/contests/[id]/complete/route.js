import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Contest from '@/models/Contest';
import Submission from '@/models/Submission';
import { safeString } from '@/lib/apiHelpers';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { memberId, name } = body;

    if (!memberId) {
      return NextResponse.json({ error: 'Missing memberId' }, { status: 400 });
    }

    await connectToDatabase();
    const contest = await Contest.findById(id);
    if (!contest) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
    }

    const cleanMemberId = safeString(memberId).trim().toUpperCase();

    // 1. Mark in completedMembers
    if (!Array.isArray(contest.completedMembers)) {
      contest.completedMembers = [];
    }
    if (!contest.completedMembers.includes(cleanMemberId)) {
      contest.completedMembers.push(cleanMemberId);
    }

    // 2. Calculate score from contest submissions if available
    let totalScore = 0;
    try {
      const subs = await Submission.find({ contestId: id, memberId: { $regex: new RegExp(`^${cleanMemberId}$`, 'i') } });
      subs.forEach(s => {
        totalScore += (s.quizScore || 0);
      });
    } catch (e) {}

    // 3. Update activeParticipants
    if (!Array.isArray(contest.activeParticipants)) {
      contest.activeParticipants = [];
    }
    const participantIndex = contest.activeParticipants.findIndex(
      p => p && p.memberId && p.memberId.trim().toUpperCase() === cleanMemberId
    );

    if (participantIndex !== -1) {
      contest.activeParticipants[participantIndex].status = 'completed';
      contest.activeParticipants[participantIndex].completedAt = new Date();
      if (totalScore > 0) {
        contest.activeParticipants[participantIndex].score = totalScore;
      }
    } else {
      contest.activeParticipants.push({
        memberId: cleanMemberId,
        name: name || cleanMemberId,
        joinedAt: new Date(),
        status: 'completed',
        completedAt: new Date(),
        score: totalScore
      });
    }

    await contest.save();

    return NextResponse.json({
      success: true,
      message: 'Contest marked as completed for user'
    });
  } catch (error) {
    console.error('Error marking contest as completed:', error);
    return NextResponse.json({ error: 'Failed to update contest status: ' + error.message }, { status: 500 });
  }
}
