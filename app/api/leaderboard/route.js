
import { connectToDatabase } from '@/lib/db';
import Member from '@/models/Member';
import Setting from '@/models/Setting';

export const revalidate = 60;

export async function GET(req) {
  try {
    await connectToDatabase();

    const leadSetting = await Setting.findOne({ key: 'leaderboardEnabled' });
    if (leadSetting && leadSetting.value === false) {
      return Response.json({ error: 'Leaderboard is currently disabled by Admin' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 100;
    const skip = (page - 1) * limit;

    const total = await Member.countDocuments({});
    const members = await Member.find({}).sort({ score: -1, createdAt: 1 }).skip(skip).limit(limit).lean();
    const totalPages = Math.ceil(total / limit);

    return Response.json({ members, total, page, totalPages });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return Response.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
