import { connectToDatabase } from '@/lib/db';
import TSP from '@/models/TSP';
import TSPSession from '@/models/TSPSession';
import { safeString } from '@/lib/apiHelpers';
import { verifyAdmin } from '@/lib/auth';

export async function POST(request) {
  const authError = verifyAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const tspId = body.tspId || body.contestId;
    const { memberId } = body;

    if (!tspId || !memberId) {
      return Response.json({ error: 'tspId and memberId are required' }, { status: 400 });
    }

    const cleanMemberId = safeString(memberId).toUpperCase();
    await connectToDatabase();

    const updated = await TSP.findByIdAndUpdate(
      tspId,
      { $addToSet: { restrictedMembers: cleanMemberId } },
      { returnDocument: 'after' }
    );

    if (!updated) {
      return Response.json({ error: 'TSP not found' }, { status: 404 });
    }

    return Response.json({ success: true, restrictedMembers: updated.restrictedMembers });
  } catch (error) {
    console.error('Error restricting member from TSP:', error);
    return Response.json({ error: 'Failed to restrict member' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const authError = verifyAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const tspId = body.tspId || body.contestId;
    const { memberId } = body;

    if (!tspId || !memberId) {
      return Response.json({ error: 'tspId and memberId are required' }, { status: 400 });
    }

    const cleanMemberId = safeString(memberId).toUpperCase();
    await connectToDatabase();

    const updated = await TSP.findByIdAndUpdate(
      tspId,
      {
        $pull: {
          restrictedMembers: cleanMemberId,
          completedMembers: cleanMemberId,
          violations: { memberId: { $regex: new RegExp(`^${cleanMemberId}$`, 'i') } }
        }
      },
      { returnDocument: 'after' }
    );

    // Reset status in activeParticipants if they were marked restricted or completed
    await TSP.updateOne(
      { _id: tspId, 'activeParticipants.memberId': { $regex: new RegExp(`^${cleanMemberId}$`, 'i') } },
      { $set: { 'activeParticipants.$.status': 'in_progress', 'activeParticipants.$.completedAt': null } }
    );

    // Reset TSPSession if one exists
    try {
      await TSPSession.findOneAndUpdate(
        { tspId, memberId: cleanMemberId },
        { $set: { completed: false, status: 'active', completedAt: null } }
      );
    } catch (sErr) {
      console.error('Error resetting TSPSession on unrestrict:', sErr);
    }

    if (!updated) {
      return Response.json({ error: 'TSP not found' }, { status: 404 });
    }

    return Response.json({
      success: true,
      restrictedMembers: updated.restrictedMembers,
      violations: updated.violations
    });
  } catch (error) {
    console.error('Error unrestricting member from TSP:', error);
    return Response.json({ error: 'Failed to unrestrict member' }, { status: 500 });
  }
}
