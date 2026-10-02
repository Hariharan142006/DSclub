
import { connectToDatabase } from '@/lib/db';
import Contest from '@/models/Contest';
import TSP from '@/models/TSP';
import TSPSession from '@/models/TSPSession';
import { safeString } from '@/lib/apiHelpers';
import { verifyAdmin } from '@/lib/auth';

// Restrict a member from re-entering a contest or TSP
export async function POST(request) {
  const authError = verifyAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const contestId = body.contestId || body.tspId;
    const { memberId } = body;

    if (!contestId || !memberId) {
      return Response.json({ error: 'Contest ID and Member ID are required' }, { status: 400 });
    }

    const cleanMemberId = safeString(memberId).toUpperCase();
    await connectToDatabase();

    let updated = await Contest.findByIdAndUpdate(
      contestId,
      { $addToSet: { restrictedMembers: cleanMemberId } },
      { new: true }
    );

    if (!updated) {
      updated = await TSP.findByIdAndUpdate(
        contestId,
        { $addToSet: { restrictedMembers: cleanMemberId } },
        { new: true }
      );
    }

    if (!updated) {
      return Response.json({ error: 'Contest or TSP not found' }, { status: 404 });
    }

    return Response.json({ success: true, restrictedMembers: updated.restrictedMembers });
  } catch (error) {
    console.error('Error restricting member:', error);
    return Response.json({ error: 'Failed to restrict member' }, { status: 500 });
  }
}

// Remove restriction (admin unban)
export async function DELETE(request) {
  const authError = verifyAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const contestId = body.contestId || body.tspId;
    const { memberId } = body;

    if (!contestId || !memberId) {
      return Response.json({ error: 'Contest ID and Member ID are required' }, { status: 400 });
    }

    const cleanMemberId = safeString(memberId).toUpperCase();
    await connectToDatabase();

    let updated = await Contest.findByIdAndUpdate(
      contestId,
      {
        $pull: {
          restrictedMembers: cleanMemberId,
          completedMembers: cleanMemberId,
          violations: { memberId: { $regex: new RegExp(`^${cleanMemberId}$`, 'i') } }
        }
      },
      { new: true }
    );

    if (updated) {
      await Contest.updateOne(
        { _id: contestId, 'activeParticipants.memberId': { $regex: new RegExp(`^${cleanMemberId}$`, 'i') } },
        { $set: { 'activeParticipants.$.status': 'in_progress', 'activeParticipants.$.completedAt': null } }
      );
    }

    if (!updated) {
      updated = await TSP.findByIdAndUpdate(
        contestId,
        {
          $pull: {
            restrictedMembers: cleanMemberId,
            completedMembers: cleanMemberId,
            violations: { memberId: { $regex: new RegExp(`^${cleanMemberId}$`, 'i') } }
          }
        },
        { new: true }
      );

      if (updated) {
        await TSP.updateOne(
          { _id: contestId, 'activeParticipants.memberId': { $regex: new RegExp(`^${cleanMemberId}$`, 'i') } },
          { $set: { 'activeParticipants.$.status': 'in_progress', 'activeParticipants.$.completedAt': null } }
        );

        try {
          await TSPSession.findOneAndUpdate(
            { tspId: contestId, memberId: cleanMemberId },
            { $set: { completed: false, status: 'active', completedAt: null } }
          );
        } catch (sErr) {
          console.error('Error resetting TSPSession on unrestrict:', sErr);
        }
      }
    }

    if (!updated) {
      return Response.json({ error: 'Contest or TSP not found' }, { status: 404 });
    }

    return Response.json({ success: true, restrictedMembers: updated.restrictedMembers, violations: updated.violations });
  } catch (error) {
    console.error('Error unrestricting member:', error);
    return Response.json({ error: 'Failed to unrestrict member' }, { status: 500 });
  }
}
