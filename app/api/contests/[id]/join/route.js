import Submission from '@/models/Submission';
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Contest from '@/models/Contest';
import { safeString, escapeRegex } from '@/lib/apiHelpers';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { memberId, name } = body;

    if (!memberId || !name) {
      return NextResponse.json({ error: 'Missing memberId or name' }, { status: 400 });
    }

    let cleanMemberId = safeString(memberId).trim().toUpperCase();

    await connectToDatabase();
    const contest = await Contest.findById(id);

    if (!contest) {
      return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
    }
    
    // BACKEND STANDARDIZATION: If whitelist is enabled, standardize memberId to canonical rollNo
    if (contest.whitelistEnabled && Array.isArray(contest.whitelistedStudents) && contest.whitelistedStudents.length > 0) {
      const matchedStudent = contest.whitelistedStudents.find(
        s => s && (
          (s.identifier && String(s.identifier).trim().toUpperCase() === cleanMemberId) ||
          (s.rollNo && String(s.rollNo).trim().toUpperCase() === cleanMemberId) ||
          (s.registerNo && String(s.registerNo).trim().toUpperCase() === cleanMemberId)
        )
      );
      if (matchedStudent) {
        cleanMemberId = (matchedStudent.rollNo || matchedStudent.identifier || cleanMemberId).toString().trim().toUpperCase();
      }
    }

    if (!contest.isActive) {
      return NextResponse.json({ error: 'This contest arena is currently closed or inactive' }, { status: 403 });
    }

    // Check anti-cheat restriction
    if (contest.restrictedMembers && contest.restrictedMembers.some(m => m && String(m).trim().toUpperCase() === cleanMemberId)) {
      return NextResponse.json({ error: `Member ID "${memberId}" is restricted from entering this contest arena due to anti-cheat violations.` }, { status: 403 });
    }

    // Check if student has already completed or exited this contest arena
    if (contest.completedMembers && contest.completedMembers.some(m => m && String(m).trim().toUpperCase() === cleanMemberId)) {
      return NextResponse.json({ error: `⛔ You (${cleanMemberId}) have already completed or exited this contest arena. Re-entry is strictly prohibited.` }, { status: 403 });
    }

    const completedParticipant = contest.activeParticipants?.find(
      p => p && p.memberId && String(p.memberId).trim().toUpperCase() === cleanMemberId && p.status === 'completed'
    );
    if (completedParticipant) {
      return NextResponse.json({ error: `⛔ You (${cleanMemberId}) have already completed or exited this contest arena. Re-entry is strictly prohibited.` }, { status: 403 });
    }

    // Check whitelist if enabled
    if (contest.whitelistEnabled && Array.isArray(contest.whitelistedStudents) && contest.whitelistedStudents.length > 0) {
      const isWhitelisted = contest.whitelistedStudents.some(
        s => s && (
          (s.identifier && String(s.identifier).trim().toUpperCase() === cleanMemberId) ||
          (s.rollNo && String(s.rollNo).trim().toUpperCase() === cleanMemberId) ||
          (s.registerNo && String(s.registerNo).trim().toUpperCase() === cleanMemberId)
        )
      );
      if (!isWhitelisted) {
        return NextResponse.json({ error: `Register Number / Roll Number "${cleanMemberId}" is not on the authorized participant whitelist for this Contest.` }, { status: 403 });
      }
    }

    // Check if user is already in activeParticipants
    const existingParticipant = contest.activeParticipants?.find(
      (p) => p && p.memberId && String(p.memberId).trim().toUpperCase() === cleanMemberId
    );

    if (!existingParticipant) {
      contest.activeParticipants = contest.activeParticipants || [];
      contest.activeParticipants.push({
        memberId: cleanMemberId,
        name: name || cleanMemberId,
        joinedAt: new Date(),
        status: 'in_progress',
        score: 0
      });
      await contest.save();
    }

    // Fetch submissions for this contest by this user to determine contest-specific solved state
    
    const userSubmissions = await Submission.find({ 
      contestId: id, 
      memberId: new RegExp(`^${escapeRegex(cleanMemberId)}$`, 'i') 
    }).select('challengeId');
    const solvedChallengeIds = userSubmissions.map(s => s.challengeId.toString());

    return NextResponse.json({ success: true, message: 'Joined successfully', solvedChallengeIds });
  } catch (error) {
    console.error('Error joining contest:', error);
    return NextResponse.json({ error: 'Failed to join contest: ' + error.message }, { status: 500 });
  }
}

