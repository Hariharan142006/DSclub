import { connectToDatabase } from '@/lib/db';
import Submission from '@/models/Submission';
import TSP from '@/models/TSP';
import Challenge from '@/models/Challenge';
import { verifyAdmin } from '@/lib/auth';

export async function GET(request, { params }) {
  const authError = verifyAdmin(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    
    await connectToDatabase();
    const tsp = await TSP.findById(id);
    if (!tsp) {
      return Response.json({ error: 'TSP not found' }, { status: 404 });
    }

    const submissions = await Submission.find({ contestId: id }).lean();
    
    // Fetch all challenges in this TSP to map their titles
    const challengeIds = submissions.map(s => s.challengeId);
    const challenges = await Challenge.find({ _id: { $in: challengeIds } }).lean();
    const challengeMap = {};
    challenges.forEach(ch => {
      challengeMap[ch._id.toString()] = ch.title;
    });

    const detailedSubmissions = submissions.map(sub => ({
      _id: sub._id,
      memberId: sub.memberId,
      challengeId: sub.challengeId,
      challengeTitle: challengeMap[sub.challengeId] || 'Unknown Challenge',
      type: sub.type,
      status: sub.status,
      codeSubmission: sub.codeSubmission,
      quizScore: sub.quizScore,
      totalPoints: sub.totalPoints,
      createdAt: sub.createdAt
    }));

    return Response.json(detailedSubmissions);
  } catch (error) {
    console.error('Error fetching detailed TSP submissions:', error);
    return Response.json({ error: 'Failed to fetch detailed submissions' }, { status: 500 });
  }
}
