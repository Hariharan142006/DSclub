import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import TSP from '@/models/TSP';
import TSPSession from '@/models/TSPSession';
import Challenge from '@/models/Challenge'; // Needed for population

export async function POST(req) {
  try {
    await connectToDatabase();
    const { tspId, memberId, name, passcode } = await req.json();

    if (!tspId || !memberId) {
      return NextResponse.json({ error: 'Missing tspId or memberId' }, { status: 400 });
    }

    const cleanMemberId = String(memberId).trim().toUpperCase();
    const cleanPasscode = String(passcode || '').trim().toUpperCase();

    // 1. Fetch TSP first to validate status, restriction, whitelist, and passcode
    const tsp = await TSP.findById(tspId);
    if (!tsp) {
      return NextResponse.json({ error: 'TSP not found' }, { status: 404 });
    }

    if (!tsp.isActive) {
      return NextResponse.json({ error: 'This TSP arena is currently closed or inactive' }, { status: 403 });
    }

    // Check anti-cheat restriction
    if (tsp.restrictedMembers && tsp.restrictedMembers.some(id => id && String(id).trim().toUpperCase() === cleanMemberId)) {
      return NextResponse.json({ error: `Member ID "${memberId}" is restricted from entering this TSP arena due to anti-cheat violations.` }, { status: 403 });
    }

    // Check if student has already completed or exited this TSP arena
    if (tsp.completedMembers && tsp.completedMembers.some(id => id && String(id).trim().toUpperCase() === cleanMemberId)) {
      return NextResponse.json({ error: `⛔ You (${cleanMemberId}) have already completed or exited this TSP arena. Re-entry is strictly prohibited.` }, { status: 403 });
    }

    const completedParticipant = tsp.activeParticipants?.find(
      p => p && p.memberId && String(p.memberId).trim().toUpperCase() === cleanMemberId && p.status === 'completed'
    );
    if (completedParticipant) {
      return NextResponse.json({ error: `⛔ You (${cleanMemberId}) have already completed or exited this TSP arena. Re-entry is strictly prohibited.` }, { status: 403 });
    }

    // Check whitelist if enabled
    if (tsp.whitelistEnabled && Array.isArray(tsp.whitelistedStudents) && tsp.whitelistedStudents.length > 0) {
      const isWhitelisted = tsp.whitelistedStudents.some(
        s => s && (
          (s.identifier && String(s.identifier).trim().toUpperCase() === cleanMemberId) ||
          (s.rollNo && String(s.rollNo).trim().toUpperCase() === cleanMemberId) ||
          (s.registerNo && String(s.registerNo).trim().toUpperCase() === cleanMemberId)
        )
      );
      if (!isWhitelisted) {
        return NextResponse.json({ error: `Roll Number / Register Number "${memberId}" is not on the authorized participant whitelist for this TSP.` }, { status: 403 });
      }
    }

    // Check access codes if required
    let validPasscodes = [];
    if (Array.isArray(tsp.accessCodes) && tsp.accessCodes.length > 0) {
      validPasscodes = tsp.accessCodes
        .filter(c => c && c.isActive !== false && c.code && c.code.trim() !== '')
        .map(c => c.code.trim());
    }
    if (tsp.passcode && tsp.passcode.trim() !== '') {
      if (!validPasscodes.some(p => p.toUpperCase() === tsp.passcode.trim().toUpperCase())) {
        validPasscodes.push(tsp.passcode.trim());
      }
    }

    let actualPasscodeUsed = cleanPasscode;
    if (tsp.passcodeEnabled && validPasscodes.length > 0) {
      if (!cleanPasscode) {
        return NextResponse.json(
          { error: '⛔ Access Code Required. Please enter the confidential code provided by your instructor.' },
          { status: 403 }
        );
      }

      const norm = (str) => String(str || '').replace(/\s+/g, '').toUpperCase();
      const enteredNorm = norm(cleanPasscode);

      const matchedCode = validPasscodes.find(
        vp => norm(vp) === enteredNorm
      );

      if (!matchedCode) {
        return NextResponse.json(
          { error: '⛔ Invalid TSP Test Access Code. Please enter the correct code provided by your instructor.' },
          { status: 403 }
        );
      }
      actualPasscodeUsed = matchedCode.trim();
    }

    // Record active participant if not already registered, or update passcode
    const existingIndex = tsp.activeParticipants?.findIndex(
      p => p && p.memberId && String(p.memberId).trim().toUpperCase() === cleanMemberId
    );
    if (existingIndex === -1 || existingIndex === undefined) {
      tsp.activeParticipants = tsp.activeParticipants || [];
      tsp.activeParticipants.push({
        memberId: cleanMemberId,
        name: name || cleanMemberId,
        joinedAt: new Date(),
        passcodeUsed: actualPasscodeUsed,
        score: 0,
        status: 'in_progress'
      });
      await tsp.save();
    } else if (actualPasscodeUsed && !tsp.activeParticipants[existingIndex].passcodeUsed) {
      tsp.activeParticipants[existingIndex].passcodeUsed = actualPasscodeUsed;
      await tsp.save();
    }

    // 2. Check if user already has an active session for this TSP
    // Helper to format assigned challenges with pool-assigned marks
    const formatSessionChallenges = (sessDoc, tspDoc) => {
      const sessObj = sessDoc.toObject ? sessDoc.toObject() : { ...sessDoc };
      if (Array.isArray(sessObj.assignedChallenges)) {
        sessObj.assignedChallenges = sessObj.assignedChallenges.map(ch => {
          if (!ch) return ch;
          const chIdStr = (ch._id || ch.id || '').toString();
          let assignedPts = null;
          if (Array.isArray(sessDoc.challengePoints)) {
            const cp = sessDoc.challengePoints.find(p => (p.challengeId?._id || p.challengeId || '').toString() === chIdStr);
            if (cp && cp.points) assignedPts = cp.points;
          }
          if (assignedPts === null && Array.isArray(tspDoc.pools)) {
            const matchingPool = tspDoc.pools.find(p =>
              Array.isArray(p.availableChallenges) &&
              p.availableChallenges.some(ac => (ac?._id || ac || '').toString() === chIdStr)
            );
            if (matchingPool) {
              assignedPts = matchingPool.type === 'quiz' ? 1 : (Number(matchingPool.pointsPerQuestion) || 10);
            }
          }
          if (assignedPts !== null) {
            // For quiz, standard total points = numQuestions * 1
            const effectivePts = ch.type === 'quiz' && Array.isArray(ch.quizQuestions) && ch.quizQuestions.length > 0
              ? ch.quizQuestions.length * assignedPts
              : assignedPts;
            return { ...ch, points: effectivePts };
          }
          return ch;
        });
      }
      return sessObj;
    };

    let session = await TSPSession.findOne({ tspId, memberId: cleanMemberId }).populate('assignedChallenges');

    if (session) {
      if (session.completed || session.status === 'completed') {
        return NextResponse.json({ error: `⛔ You (${cleanMemberId}) have already completed or exited this TSP arena. Re-entry is strictly prohibited.` }, { status: 403 });
      }
      if (!session.passcodeUsed && actualPasscodeUsed) {
        session.passcodeUsed = actualPasscodeUsed;
        await session.save();
      }
      const formatted = formatSessionChallenges(session, tsp);
      return NextResponse.json({ session: formatted });
    }

    // 3. If no session, generate a randomized question set based on TSP Pools
    // Initialize with fixed challenges
    const assignedChallengeIds = [...(tsp.challenges || [])];
    const challengePoints = [];

    // Fisher-Yates shuffle function
    const shuffleArray = (array) => {
      const arr = [...array];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };

    for (const pool of tsp.pools || []) {
      const available = pool.availableChallenges || [];
      if (available.length === 0) continue;
      
      const shuffled = shuffleArray(available);
      // Pick up to 'count' items from the pool
      const selected = shuffled.slice(0, pool.count);
      const poolPts = pool.type === 'quiz' ? 1 : (Number(pool.pointsPerQuestion) || 10);

      for (const selId of selected) {
        assignedChallengeIds.push(selId);
        challengePoints.push({
          challengeId: selId,
          points: poolPts
        });
      }
    }

    // Create a new TSPSession to lock in these questions for the user
    const newSession = await TSPSession.create({
      tspId,
      memberId: cleanMemberId,
      assignedChallenges: assignedChallengeIds,
      challengePoints,
      startedAt: new Date(),
      passcodeUsed: actualPasscodeUsed,
      status: 'active',
      score: 0
    });

    const populatedSession = await TSPSession.findById(newSession._id).populate('assignedChallenges');
    const formatted = formatSessionChallenges(populatedSession, tsp);

    return NextResponse.json({ session: formatted });

  } catch (error) {
    console.error('TSP Join Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
