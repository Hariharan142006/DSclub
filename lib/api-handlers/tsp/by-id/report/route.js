import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import TSP from '@/models/TSP';
import TSPSession from '@/models/TSPSession';
import Submission from '@/models/Submission';
import Challenge from '@/models/Challenge';
import Member from '@/models/Member';
import { verifyAdmin } from '@/lib/auth';

export async function GET(request, { params }) {
  const authError = verifyAdmin(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const filterPasscode = searchParams.get('passcode'); // 'ALL' or specific code

    await connectToDatabase();

    const tsp = await TSP.findById(id).lean();
    if (!tsp) {
      return NextResponse.json({ error: 'TSP not found' }, { status: 404 });
    }

    // 1. Fetch all submissions for this TSP
    const submissions = await Submission.find({ contestId: id }).lean();

    // 2. Fetch all TSPSessions for this TSP
    const sessions = await TSPSession.find({ tspId: id }).lean();

    // 3. Fetch all Challenges associated with this TSP
    const poolChallengeIds = [];
    if (Array.isArray(tsp.pools)) {
      tsp.pools.forEach(p => {
        if (Array.isArray(p.availableChallenges)) {
          p.availableChallenges.forEach(chId => {
            if (chId) poolChallengeIds.push(chId.toString());
          });
        }
      });
    }
    const directChallengeIds = Array.isArray(tsp.challenges) ? tsp.challenges.map(c => c.toString()) : [];
    const submissionChallengeIds = submissions.map(s => (s.challengeId || '').toString()).filter(Boolean);
    const sessionChallengeIds = [];
    sessions.forEach(sess => {
      if (Array.isArray(sess.assignedChallenges)) {
        sess.assignedChallenges.forEach(ac => {
          if (ac) sessionChallengeIds.push(ac.toString());
        });
      }
    });

    const allChallengeIdSet = new Set([
      ...poolChallengeIds,
      ...directChallengeIds,
      ...submissionChallengeIds,
      ...sessionChallengeIds
    ]);

    const challengeDocs = await Challenge.find({
      _id: { $in: Array.from(allChallengeIdSet) }
    }).lean();

    const challengeMap = {};
    challengeDocs.forEach(ch => {
      const chIdStr = ch._id.toString();
      challengeMap[chIdStr] = {
        _id: chIdStr,
        title: ch.title,
        type: ch.type, // 'quiz', 'code', 'tsp'
        difficulty: ch.difficulty || 'Medium',
        points: ch.points || 10,
        totalTestCases: Array.isArray(ch.codeDetails?.testCases) ? ch.codeDetails.testCases.length : 0
      };
    });

    // Calculate fallback max easy points from pools
    let poolMaxEasy = 0;
    if (Array.isArray(tsp.pools)) {
      tsp.pools.forEach(p => {
        if (p.difficulty === 'Easy') {
          const pts = p.type === 'quiz' ? 1 : (Number(p.pointsPerQuestion) || 10);
          poolMaxEasy += (Number(p.count) || 0) * pts;
        }
      });
    }

    // 4. Fetch all members from Member collection for metadata fallback
    const allMembers = await Member.find({}).lean();
    const memberMap = {};
    allMembers.forEach(m => {
      if (m && m.memberId) {
        memberMap[String(m.memberId).trim().toUpperCase()] = m;
      }
    });

    // 5. Gather all participants
    const studentMap = new Map();

    // From activeParticipants
    if (Array.isArray(tsp.activeParticipants)) {
      tsp.activeParticipants.forEach(p => {
        if (!p || !p.memberId) return;
        const cleanId = String(p.memberId).trim().toUpperCase();
        studentMap.set(cleanId, {
          memberId: cleanId,
          name: p.name || '',
          passcodeUsed: (p.passcodeUsed || '').trim().toUpperCase(),
          status: p.status === 'completed' ? 'Completed' : p.status === 'restricted' ? 'Disqualified' : 'In Progress',
          score: Number(p.score) || 0,
          joinedAt: p.joinedAt || null,
          completedAt: p.completedAt || null
        });
      });
    }

    // From TSPSessions
    sessions.forEach(sess => {
      if (!sess || !sess.memberId) return;
      const cleanId = String(sess.memberId).trim().toUpperCase();
      const existing = studentMap.get(cleanId);
      if (!existing) {
        studentMap.set(cleanId, {
          memberId: cleanId,
          name: '',
          passcodeUsed: (sess.passcodeUsed || '').trim().toUpperCase(),
          status: sess.completed ? 'Completed' : 'In Progress',
          score: Number(sess.score) || 0,
          joinedAt: sess.startedAt || null,
          completedAt: sess.completedAt || null
        });
      } else {
        if (!existing.passcodeUsed && sess.passcodeUsed) {
          existing.passcodeUsed = String(sess.passcodeUsed).trim().toUpperCase();
        }
        if (sess.completed) {
          existing.status = 'Completed';
          existing.completedAt = sess.completedAt || existing.completedAt || new Date();
        }
      }
    });

    // From submissions (if any student submitted but wasn't in activeParticipants)
    submissions.forEach(sub => {
      if (!sub || !sub.memberId) return;
      const cleanId = String(sub.memberId).trim().toUpperCase();
      if (!studentMap.has(cleanId)) {
        studentMap.set(cleanId, {
          memberId: cleanId,
          name: '',
          passcodeUsed: '',
          status: 'In Progress',
          score: 0,
          joinedAt: sub.createdAt || null,
          completedAt: null
        });
      }
    });

    // Map completedMembers from TSP document
    if (Array.isArray(tsp.completedMembers)) {
      tsp.completedMembers.forEach(cmId => {
        if (!cmId) return;
        const cleanId = String(cmId).trim().toUpperCase();
        if (studentMap.has(cleanId)) {
          studentMap.get(cleanId).status = 'Completed';
        }
      });
    }

    // 6. Build the detailed student results
    const reportData = [];

    for (const [cleanId, studentObj] of studentMap.entries()) {
      // Find identity details from whitelist first
      let resolvedName = studentObj.name;
      let resolvedRollNo = cleanId;
      let resolvedRegisterNo = '—';

      const whitelisted = (tsp.whitelistedStudents || []).find(s => {
        if (!s) return false;
        const sIdent = String(s.identifier || '').trim().toUpperCase();
        const sRoll = String(s.rollNo || '').trim().toUpperCase();
        const sReg = String(s.registerNo || '').trim().toUpperCase();
        return sIdent === cleanId || sRoll === cleanId || sReg === cleanId;
      });

      if (whitelisted) {
        resolvedName = whitelisted.name || resolvedName;
        resolvedRollNo = whitelisted.rollNo || whitelisted.identifier || cleanId;
        resolvedRegisterNo = whitelisted.registerNo || '—';
      }

      // Check global Member collection if still lacking name or registerNo
      const globalMem = memberMap[cleanId];
      if (globalMem) {
        if (!resolvedName || resolvedName === cleanId) {
          resolvedName = globalMem.name || resolvedName;
        }
        if (resolvedRegisterNo === '—' && globalMem.registerNo) {
          resolvedRegisterNo = globalMem.registerNo;
        }
      }

      if (!resolvedName) resolvedName = cleanId;

      // Find session for this student to calculate assigned max points
      const studentSession = sessions.find(s => String(s.memberId).trim().toUpperCase() === cleanId);
      
      let maxEasy = 0;
      if (studentSession && Array.isArray(studentSession.assignedChallenges)) {
        studentSession.assignedChallenges.forEach(acId => {
          const acStr = (acId?._id || acId || '').toString();
          const chObj = challengeMap[acStr];
          if (chObj && chObj.difficulty === 'Easy') {
            let pts = chObj.points || 1;
            if (Array.isArray(studentSession.challengePoints)) {
              const cp = studentSession.challengePoints.find(p => (p.challengeId?._id || p.challengeId || '').toString() === acStr);
              if (cp && cp.points) pts = cp.points;
            }
            maxEasy += pts;
          }
        });
      }
      if (maxEasy === 0 && poolMaxEasy > 0) {
        maxEasy = poolMaxEasy;
      }

      // Filter student submissions
      const studentSubs = submissions.filter(s => String(s.memberId).trim().toUpperCase() === cleanId);

      let scoreEasy = 0;
      let scoreMedium = 0;
      let scoreHard = 0;

      let mediumTestCasesPassed = 0;
      let mediumTestCasesTotal = 0;

      let hardTestCasesPassed = 0;
      let hardTestCasesTotal = 0;

      // Track challenges processed to prevent duplicate scoring
      const processedChallenges = new Set();

      studentSubs.forEach(sub => {
        const chIdStr = (sub.challengeId || '').toString();
        const chInfo = challengeMap[chIdStr] || { difficulty: 'Medium', points: 10, totalTestCases: 0 };
        const diff = chInfo.difficulty || 'Medium';
        const subScore = Number(sub.quizScore != null ? sub.quizScore : (sub.totalPoints || 0));

        if (diff === 'Easy') {
          scoreEasy += subScore;
        } else if (diff === 'Medium') {
          scoreMedium += subScore;
          mediumTestCasesPassed += Number(sub.passedTestCases || 0);
          mediumTestCasesTotal += Number(sub.totalTestCases || chInfo.totalTestCases || 0);
        } else if (diff === 'Hard') {
          scoreHard += subScore;
          hardTestCasesPassed += Number(sub.passedTestCases || 0);
          hardTestCasesTotal += Number(sub.totalTestCases || chInfo.totalTestCases || 0);
        }

        processedChallenges.add(chIdStr);
      });

      const totalCalculatedScore = scoreEasy + scoreMedium + scoreHard;
      const finalScore = Math.max(totalCalculatedScore, studentObj.score || 0);

      // Access code label
      let codeLabel = '';
      if (studentObj.passcodeUsed && Array.isArray(tsp.accessCodes)) {
        const matched = tsp.accessCodes.find(c => c && c.code && c.code.trim().toUpperCase() === studentObj.passcodeUsed);
        if (matched && matched.label) codeLabel = matched.label;
      }

      reportData.push({
        memberId: cleanId,
        name: resolvedName,
        rollNo: resolvedRollNo,
        registerNo: resolvedRegisterNo,
        scoreEasy,
        maxEasy: maxEasy || (scoreEasy > 0 ? scoreEasy : 10),
        scoreMedium,
        mediumTestCasesPassed,
        mediumTestCasesTotal,
        scoreHard,
        hardTestCasesPassed,
        hardTestCasesTotal,
        totalScore: finalScore,
        passcodeUsed: studentObj.passcodeUsed || (tsp.passcodeEnabled ? 'N/A' : 'Open Entry'),
        codeLabel,
        status: studentObj.status,
        joinedAt: studentObj.joinedAt,
        completedAt: studentObj.completedAt
      });
    }

    // 7. Filter by passcode if provided
    let filteredReport = reportData;
    if (filterPasscode && filterPasscode.trim().toUpperCase() !== 'ALL') {
      const cleanFilter = filterPasscode.trim().toUpperCase();
      filteredReport = reportData.filter(r => (r.passcodeUsed || '').trim().toUpperCase() === cleanFilter);
    }

    // 8. Sort descending by totalScore, then ascending by name
    filteredReport.sort((a, b) => b.totalScore - a.totalScore || a.name.localeCompare(b.name));

    // Assign S.No
    const finalResult = filteredReport.map((item, index) => ({
      sNo: index + 1,
      ...item
    }));

    return NextResponse.json({
      tsp: {
        _id: tsp._id,
        title: tsp.title,
        accessCodes: tsp.accessCodes || [],
        passcodeEnabled: tsp.passcodeEnabled
      },
      filter: filterPasscode || 'ALL',
      totalCount: finalResult.length,
      students: finalResult
    });
  } catch (error) {
    console.error('Error generating TSP report data:', error);
    return NextResponse.json({ error: 'Failed to generate report data: ' + error.message }, { status: 500 });
  }
}
