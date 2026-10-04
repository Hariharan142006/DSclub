
import { connectToDatabase } from '@/lib/db';
import Contest from '@/models/Contest';
import { verifyAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await connectToDatabase();

    const contests = await Contest.find({}).sort({ createdAt: -1 }).lean();
    return Response.json(contests);
  } catch (error) {
    console.error('Error fetching contests:', error);
    return Response.json({ error: 'Failed to fetch contests' }, { status: 500 });
  }
}

export async function POST(request) {
  const authError = verifyAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { title, description, startTime, endTime, challenges, isActive, leaderboardEnabled, certificateEnabled, certificateTemplate, timerEnabled, timerDurationMinutes } = body;

    if (!title || !description || !startTime || !endTime) {
      return Response.json({ error: 'Missing required contest fields' }, { status: 400 });
    }

    await connectToDatabase();

    const newContest = await Contest.create({
      title,
      description,
      startTime,
      endTime,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      leaderboardEnabled: leaderboardEnabled !== undefined ? Boolean(leaderboardEnabled) : true,
      certificateEnabled: certificateEnabled !== undefined ? Boolean(certificateEnabled) : false,
      certificateTemplate: certificateTemplate || undefined,
      timerEnabled: timerEnabled !== undefined ? Boolean(timerEnabled) : false,
      timerDurationMinutes: timerDurationMinutes !== undefined ? Number(timerDurationMinutes) : 60,
      timerStatus: 'stopped',
      timerRemainingSeconds: (timerDurationMinutes !== undefined ? Number(timerDurationMinutes) : 60) * 60,
      timerLastStartedAt: null,
      challenges: Array.isArray(challenges) ? challenges : []
    });

    return Response.json(newContest, { status: 201 });
  } catch (error) {
    console.error('Error creating contest:', error);
    return Response.json({ error: 'Failed to create contest' }, { status: 500 });
  }
}
