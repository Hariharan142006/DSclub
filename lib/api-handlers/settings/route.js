
import { verifyAdmin } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Setting from '@/models/Setting';

export const revalidate = 60;

export async function GET() {
  try {
    await connectToDatabase();

    let chalSetting = await Setting.findOne({ key: 'challengesEnabled' });
    if (!chalSetting) {
      chalSetting = await Setting.create({ key: 'challengesEnabled', value: true });
    }

    let leadSetting = await Setting.findOne({ key: 'leaderboardEnabled' });
    if (!leadSetting) {
      leadSetting = await Setting.create({ key: 'leaderboardEnabled', value: true });
    }

    let joinSetting = await Setting.findOne({ key: 'joinMemberEnabled' });
    if (!joinSetting) {
      joinSetting = await Setting.create({ key: 'joinMemberEnabled', value: true });
    }

    return Response.json({
      challengesEnabled: chalSetting.value,
      leaderboardEnabled: leadSetting.value,
      joinMemberEnabled: joinSetting.value
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return Response.json({ challengesEnabled: true, leaderboardEnabled: true, joinMemberEnabled: true }, { status: 200 });
  }
}

export async function POST(request) {
  const authError = verifyAdmin(request);
  if (authError) return authError;
  try {
    const body = await request.json();
    const { challengesEnabled, leaderboardEnabled, joinMemberEnabled } = body;

    await connectToDatabase();

    if (typeof challengesEnabled === 'boolean') {
      await Setting.findOneAndUpdate(
        { key: 'challengesEnabled' },
        { value: challengesEnabled },
        { upsert: true }
      );
    }

    if (typeof leaderboardEnabled === 'boolean') {
      await Setting.findOneAndUpdate(
        { key: 'leaderboardEnabled' },
        { value: leaderboardEnabled },
        { upsert: true }
      );
    }

    if (typeof joinMemberEnabled === 'boolean') {
      await Setting.findOneAndUpdate(
        { key: 'joinMemberEnabled' },
        { value: joinMemberEnabled },
        { upsert: true }
      );
    }

    const chalSetting = await Setting.findOne({ key: 'challengesEnabled' });
    const leadSetting = await Setting.findOne({ key: 'leaderboardEnabled' });
    const joinSetting = await Setting.findOne({ key: 'joinMemberEnabled' });

    return Response.json({
      success: true,
      challengesEnabled: chalSetting ? chalSetting.value : true,
      leaderboardEnabled: leadSetting ? leadSetting.value : true,
      joinMemberEnabled: joinSetting ? joinSetting.value : true
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return Response.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
