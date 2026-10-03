
import { connectToDatabase } from '@/lib/db';
import Contest from '@/models/Contest';
import TSP from '@/models/TSP';
import { safeString } from '@/lib/apiHelpers';

// POST /api/contests/violation
// Records a proctoring violation for a member in a contest or TSP.
// Auto-restricts the member when violations reach 3.
export async function POST(request) {
  try {
    const body = await request.json();
    const { contestId, memberId } = body;

    if (!contestId || !memberId) {
      return Response.json(
        { error: 'contestId and memberId are required' },
        { status: 400 }
      );
    }

    const cleanMemberId = safeString(memberId).toUpperCase();

    await connectToDatabase();

    // Check if it's Contest or TSP
    let isTSP = false;
    let competition = await Contest.findById(contestId);
    let Model = Contest;

    if (!competition) {
      competition = await TSP.findById(contestId);
      Model = TSP;
      isTSP = true;
    }

    if (!competition) {
      return Response.json({ error: 'Contest or TSP not found' }, { status: 404 });
    }

    // Try to atomically increment if member already has a record in violations array
    let updated = await Model.findOneAndUpdate(
      {
        _id: contestId,
        'violations.memberId': { $regex: new RegExp(`^${cleanMemberId}$`, 'i') }
      },
      {
        $inc: { 'violations.$.count': 1 }
      },
      { new: true }
    );

    let newCount = 1;
    let restrictedMembers = [];

    if (updated) {
      const vRec = updated.violations?.find(
        (v) => v.memberId && v.memberId.toUpperCase() === cleanMemberId
      );
      newCount = vRec ? vRec.count : 1;
      restrictedMembers = updated.restrictedMembers || [];
    } else {
      // First violation for this member: push new record
      const pushed = await Model.findByIdAndUpdate(
        contestId,
        {
          $push: { violations: { memberId: cleanMemberId, count: 1 } }
        },
        { new: true }
      );
      newCount = 1;
      restrictedMembers = pushed?.restrictedMembers || [];
    }

    // Auto-restrict at 10 violations
    const isRestricted = newCount >= 10;
    if (isRestricted && !restrictedMembers.includes(cleanMemberId)) {
      const restrictedDoc = await Model.findByIdAndUpdate(
        contestId,
        {
          $addToSet: { restrictedMembers: cleanMemberId }
        },
        { new: true }
      );
      restrictedMembers = restrictedDoc?.restrictedMembers || [...restrictedMembers, cleanMemberId];
    }

    return Response.json({
      success: true,
      memberId: cleanMemberId,
      violationCount: newCount,
      restricted: isRestricted,
      restrictedMembers,
    });
  } catch (error) {
    console.error('Error recording violation:', error);
    return Response.json(
      { error: 'Failed to record violation', detail: error.message },
      { status: 500 }
    );
  }
}
