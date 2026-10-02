
import { connectToDatabase } from '@/lib/db';
import Submission from '@/models/Submission';
import Member from '@/models/Member';
import Contest from '@/models/Contest';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get('admin') === 'true';

    await connectToDatabase();

    const contest = await Contest.findById(id);
    if (!contest) {
      return Response.json({ error: 'Contest not found' }, { status: 404 });
    }

    if (!isAdmin && contest.leaderboardEnabled === false) {
      return Response.json({ error: '🔒 The leaderboard for this contest is currently hidden by an administrator.', disabled: true }, { status: 403 });
    }

    const contestSubmissions = await Submission.find({ contestId: id });
    const uniqueMemberIds = [...new Set(contestSubmissions.map(s => String(s.memberId).toLowerCase()))];
    const allMembers = await Member.find({
      memberId: { $in: uniqueMemberIds.map(id => new RegExp(`^${id}$`, 'i')) }
    });

    // Aggregate highest score per challenge for each member in this contest
    const memberScores = {}; // memberId -> { [challengeId]: maxScore }
    const memberSubCounts = {}; // memberId -> count

    contestSubmissions.forEach(sub => {
      if (!sub.memberId) return;
      const mId = String(sub.memberId).toLowerCase();
      const cId = String(sub.challengeId);
      const score = Number(sub.quizScore != null ? sub.quizScore : (sub.totalPoints || 0));

      if (!memberScores[mId]) {
        memberScores[mId] = {};
        memberSubCounts[mId] = 0;
      }

      memberSubCounts[mId]++;
      if (memberScores[mId][cId] === undefined || score > memberScores[mId][cId]) {
        memberScores[mId][cId] = score;
      }
    });

    const leaderboard = [];
    Object.keys(memberScores).forEach(mId => {
      const scoresMap = memberScores[mId];
      const totalScore = Object.values(scoresMap).reduce((sum, val) => sum + val, 0);
      
      // Try to find the member in the global DB
      const m = allMembers.find(member => String(member.memberId).toLowerCase() === mId);
      
      if (m) {
        leaderboard.push({
          _id: m._id,
          memberId: m.memberId,
          name: m.name || 'Anonymous Member',
          department: m.department || 'AI & DS',
          year: m.year || '3rd Year',
          score: totalScore,
          submissionsCount: memberSubCounts[mId] || 1
        });
      } else {
        // Not in global DB. Maybe they are a whitelisted student using Roll Number
        const whitelistedStudent = contest.whitelistedStudents?.find(ws => ws.identifier?.toLowerCase() === mId);
        leaderboard.push({
          _id: mId, // Use their identifier as _id for React keys
          memberId: mId.toUpperCase(),
          name: whitelistedStudent ? whitelistedStudent.name : 'Unknown Student',
          department: 'Contest Participant',
          year: '-',
          score: totalScore,
          submissionsCount: memberSubCounts[mId] || 1
        });
      }
    });

    // Sort descending by score, then ascending by name
    leaderboard.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

    return Response.json(leaderboard);
  } catch (error) {
    console.error('Error fetching contest leaderboard:', error);
    return Response.json({ error: 'Failed to fetch contest leaderboard' }, { status: 500 });
  }
}
