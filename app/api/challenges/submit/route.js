
import { connectToDatabase } from '@/lib/db';
import Submission from '@/models/Submission';
import Challenge from '@/models/Challenge';
import Member from '@/models/Member';
import Contest from '@/models/Contest';
import TSP from '@/models/TSP';
import TSPSession from '@/models/TSPSession';
import { safeString, escapeRegex } from '@/lib/apiHelpers';

export async function POST(request) {
  try {
    const body = await request.json();
    const { challengeId, memberId, type, codeSubmission, quizAnswers, contestId, passedTestCases, totalTestCases } = body;

    if (!challengeId || !memberId || !type) {
      return Response.json({ error: 'Missing required submission fields' }, { status: 400 });
    }

    await connectToDatabase();

    if (contestId) {
      const competition = (await Contest.findById(contestId)) || (await TSP.findById(contestId));
      if (competition && competition.timerEnabled) {
        if (competition.timerStatus !== 'running') {
          return Response.json({ error: `⏰ The arena timer is currently ${competition.timerStatus?.toUpperCase()}. Submissions are closed!` }, { status: 403 });
        }
        if (competition.timerLastStartedAt) {
          const elapsed = Math.floor((Date.now() - new Date(competition.timerLastStartedAt).getTime()) / 1000);
          const remaining = (competition.timerRemainingSeconds || competition.timerDurationMinutes * 60) - elapsed;
          if (remaining <= 0) {
            await Contest.findByIdAndUpdate(contestId, { $set: { timerStatus: 'ended', isActive: false, timerRemainingSeconds: 0 } });
            await TSP.findByIdAndUpdate(contestId, { $set: { timerStatus: 'ended', isActive: false, timerRemainingSeconds: 0 } });
            return Response.json({ error: "⏰ The arena timer has ended! Submissions are closed!" }, { status: 403 });
          }
        }
      }

      if (competition && competition.whitelistEnabled) {
        const isWhitelisted = competition.whitelistedStudents?.some(
          student => (student.identifier && student.identifier.toLowerCase() === memberId.toLowerCase()) ||
                     (student.rollNo && student.rollNo.toLowerCase() === memberId.toLowerCase()) ||
                     (student.registerNo && student.registerNo.toLowerCase() === memberId.toLowerCase())
        );
        const isGlobalMember = await Member.findOne({ memberId: { $regex: new RegExp(`^${escapeRegex(safeString(memberId))}$`, 'i') } });
        
        if (!isWhitelisted && !isGlobalMember) {
          return Response.json({ error: '⛔ You are not on the authorized participant whitelist for this arena.' }, { status: 403 });
        }
      }

      const cleanMid = safeString(memberId).trim().toUpperCase();
      if (competition && competition.completedMembers && competition.completedMembers.some(id => id && String(id).trim().toUpperCase() === cleanMid)) {
        return Response.json({ error: '⛔ You have already completed or exited this arena. Submissions are permanently locked.' }, { status: 403 });
      }
    }

    // Enforce single submission per challenge per member (scoped to contest/TSP if in an arena)
    const existingSubQuery = {
      challengeId,
      memberId: { $regex: new RegExp(`^${escapeRegex(safeString(memberId))}$`, 'i') }
    };
    if (contestId) {
      existingSubQuery.contestId = contestId;
    }
    const existingSub = await Submission.findOne(existingSubQuery);
    if (existingSub) {
      return Response.json({ error: 'You have already submitted a solution for this challenge! Multiple submissions are not permitted.' }, { status: 400 });
    }

    let quizScore = 0;
    let totalPoints = 0;
    const challenge = await Challenge.findById(challengeId);

    if (challenge) {
      totalPoints = challenge.points || 100;
      let poolMark = null;

      // Check if submission is inside a TSP arena to retrieve pool-assigned points
      if (contestId) {
        try {
          const cleanMemberId = String(memberId).trim().toUpperCase();
          const tspDoc = await TSP.findById(contestId);
          if (tspDoc) {
            const session = await TSPSession.findOne({ tspId: contestId, memberId: cleanMemberId });
            if (session && Array.isArray(session.challengePoints)) {
              const cp = session.challengePoints.find(p => (p.challengeId?._id || p.challengeId || '').toString() === challengeId.toString());
              if (cp && cp.points) poolMark = cp.points;
            }
            if (poolMark === null && Array.isArray(tspDoc.pools)) {
              const matchingPool = tspDoc.pools.find(p => 
                Array.isArray(p.availableChallenges) && 
                p.availableChallenges.some(ac => (ac?._id || ac || '').toString() === challengeId.toString())
              );
              if (matchingPool) {
                poolMark = matchingPool.type === 'quiz' ? 1 : (Number(matchingPool.pointsPerQuestion) || 10);
              }
            }
          }
        } catch (e) {
          console.error('Error fetching pool mark in submission:', e);
        }
      }

      if (type === 'quiz' && Array.isArray(quizAnswers)) {
        if (Array.isArray(challenge.quizQuestions)) {
          let correctCount = 0;
          challenge.quizQuestions.forEach((q, idx) => {
            if (quizAnswers[idx] === q.correctIndex) {
              correctCount++;
            }
          });
          if (poolMark !== null) {
            // In TSP: standard 1 mark per quiz question
            quizScore = correctCount * poolMark;
            totalPoints = (challenge.quizQuestions.length || 1) * poolMark;
          } else {
            quizScore = Math.round((correctCount / challenge.quizQuestions.length) * totalPoints);
          }
        }
      } else if (type === 'code' || type === 'tsp') {
        const fullMark = poolMark !== null ? poolMark : totalPoints;
        totalPoints = fullMark;
        const actualTotalCases = challenge?.codeDetails?.testCases?.length || 1;

        let validPassed = typeof passedTestCases === 'number' ? passedTestCases : 0;
        let validTotal = typeof totalTestCases === 'number' && totalTestCases > 0 ? totalTestCases : actualTotalCases;
        
        // Prevent spoofing more test cases than actually exist
        if (validPassed > actualTotalCases) validPassed = actualTotalCases;
        if (validTotal !== actualTotalCases) validTotal = actualTotalCases;
        if (validPassed < 0) validPassed = 0;

        quizScore = Math.round((validPassed / validTotal) * fullMark);
      }
    }

    const newSub = await Submission.create({
      challengeId,
      memberId,
      type,
      status: 'approved',
      codeSubmission: codeSubmission || '',
      quizScore,
      totalPoints,
      passedTestCases: typeof passedTestCases === 'number' ? Math.min(passedTestCases, challenge?.codeDetails?.testCases?.length || 1) : 0,
      totalTestCases: challenge?.codeDetails?.testCases?.length || 1,
      contestId: contestId || null
    });

    await Member.findOneAndUpdate(
      { memberId: { $regex: new RegExp(`^${escapeRegex(safeString(memberId))}$`, 'i') } },
      { $inc: { score: quizScore } }
    );

    // If submitted inside a TSP arena, persist student test session data
    if (contestId) {
      try {
        const cleanMemberId = String(memberId).trim().toUpperCase();
        const tspDoc = await TSP.findById(contestId);
        if (tspDoc) {
          const session = await TSPSession.findOne({ tspId: contestId, memberId: cleanMemberId });
          if (session) {
            session.score = (session.score || 0) + quizScore;
            if (!session.solvedChallenges) session.solvedChallenges = [];
            if (!session.solvedChallenges.some(id => id.toString() === challengeId.toString())) {
              session.solvedChallenges.push(challengeId);
            }
            const totalAssigned = session.assignedChallenges?.length || 0;
            if (totalAssigned > 0 && session.solvedChallenges.length >= totalAssigned) {
              session.completed = true;
              session.completedAt = new Date();
              session.status = 'completed';
            }
            await session.save();

            // Sync with activeParticipants & completedMembers in TSP
            if (Array.isArray(tspDoc.activeParticipants)) {
              const p = tspDoc.activeParticipants.find(
                ap => ap && String(ap.memberId).trim().toUpperCase() === cleanMemberId
              );
              if (p) {
                p.score = session.score;
                if (session.completed) {
                  p.status = 'completed';
                  p.completedAt = session.completedAt;
                }
              }
            }
            if (session.completed) {
              tspDoc.completedMembers = tspDoc.completedMembers || [];
              if (!tspDoc.completedMembers.includes(cleanMemberId)) {
                tspDoc.completedMembers.push(cleanMemberId);
              }
            }
            await tspDoc.save();
          }
        } else {
          // Sync with regular Contest activeParticipants
          const contestDoc = await Contest.findById(contestId);
          if (contestDoc && Array.isArray(contestDoc.activeParticipants)) {
            const p = contestDoc.activeParticipants.find(
              ap => ap && String(ap.memberId).trim().toUpperCase() === cleanMemberId
            );
            if (p) {
              p.score = (p.score || 0) + quizScore;
              await contestDoc.save();
            }
          }
        }
      } catch (err) {
        console.error('Error syncing contest session test data:', err);
      }
    }

    if (type === 'quiz') {
      const sanitizedSub = newSub.toObject ? newSub.toObject() : { ...newSub };
      delete sanitizedSub.quizScore;
      return Response.json({ success: true, submission: sanitizedSub }, { status: 201 });
    }

    return Response.json({
      success: true,
      submission: newSub,
      score: quizScore,
      totalPoints,
      passedTestCases: newSub.passedTestCases,
      totalTestCases: newSub.totalTestCases
    }, { status: 201 });
  } catch (error) {
    console.error('Error submitting challenge:', error);
    return Response.json({ error: 'Failed to record submission: ' + error.message }, { status: 500 });
  }
}
