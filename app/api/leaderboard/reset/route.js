
import { verifyAdmin } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Member from '@/models/Member';
import Submission from '@/models/Submission';
import Contest from '@/models/Contest';
import TSP from '@/models/TSP';
import TSPSession from '@/models/TSPSession';

export async function POST(request) {
  const authError = verifyAdmin(request);
  if (authError) return authError;
  try {
    const body = await request.json().catch(() => ({}));
    const { contestId, tspId, global } = body;
    const targetId = contestId || tspId;

    await connectToDatabase();

    if (targetId) {
      const idStr = String(targetId);

      // Find submissions to revert member scores
      const submissionsToReset = await Submission.find({ contestId: idStr });
      
      // Revert scores for global members
      for (const sub of submissionsToReset) {
        if (sub.memberId && sub.quizScore) {
          await Member.findOneAndUpdate(
            { memberId: { $regex: new RegExp(`^${sub.memberId}$`, 'i') } },
            { $inc: { score: -sub.quizScore } }
          );
        }
      }

      await Member.updateMany({ score: { $lt: 0 } }, { $set: { score: 0 } });

      // Reset submissions for this contest / TSP in MongoDB
      const res = await Submission.deleteMany({ contestId: idStr });
      
      // Clear active participants and violations in Contest document (if contest)
      await Contest.findByIdAndUpdate(targetId, {
        $set: { activeParticipants: [], violations: [] }
      });

      // Clear active participants and violations in TSP document (if TSP)
      await TSP.findByIdAndUpdate(targetId, {
        $set: { activeParticipants: [], violations: [] }
      });

      // Clear student locked question sessions for this TSP
      await TSPSession.deleteMany({ tspId: idStr });

      return Response.json({
        success: true,
        message: `Arena leaderboard reset successfully! (${res.deletedCount || 0} submissions cleared and participants/sessions emptied)`
      });
    }

    if (global === true) {
      // Reset global club leaderboard in MongoDB ONLY if explicitly requested
      await Member.updateMany({}, {
        $set: {
          score: 0,
          solvedChallenges: [],
          hackathonsWon: 0,
          quizScores: 0
        }
      });
      await Submission.deleteMany({});

      return Response.json({
        success: true,
        message: 'Global Club Leaderboard reset to 0 XP for all members! All submissions cleared.'
      });
    }

    return Response.json({ error: 'Missing contestId, tspId, or global=true parameter' }, { status: 400 });
  } catch (error) {
    console.error('Error resetting leaderboard:', error);
    return Response.json({ error: 'Failed to reset leaderboard: ' + error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  return POST(request);
}
