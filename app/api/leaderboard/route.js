
import { connectToDatabase } from '@/lib/db';
import Member from '@/models/Member';
import Setting from '@/models/Setting';

export async function GET() {
  try {
    await connectToDatabase();

    const leadSetting = await Setting.findOne({ key: 'leaderboardEnabled' });
    if (leadSetting && leadSetting.value === false) {
      return Response.json({ error: 'Leaderboard is currently disabled by Admin' }, { status: 403 });
    }

    const members = await Member.find({}).sort({ score: -1, createdAt: 1 }).lean();
    return Response.json(members);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return Response.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
