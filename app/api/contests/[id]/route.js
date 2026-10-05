
import { connectToDatabase } from '@/lib/db';
import Contest from '@/models/Contest';
import { verifyAdmin } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const contest = await Contest.findById(id);
    if (!contest) {
      return Response.json({ error: 'Contest not found' }, { status: 404 });
    }
    return Response.json(contest);
  } catch (error) {
    console.error('Error fetching contest:', error);
    return Response.json({ error: 'Failed to fetch contest' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const authError = verifyAdmin(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await request.json();

    await connectToDatabase();

    const oldContest = await Contest.findById(id);
    if (!oldContest) {
      return Response.json({ error: 'Contest not found' }, { status: 404 });
    }

    if (body.whitelistedStudents !== undefined) {
      const oldList = oldContest.whitelistedStudents || [];
      const newList = body.whitelistedStudents || [];
      
      const newIdentifiers = new Set(newList.map(s => (s.rollNo || s.identifier || '').trim().toUpperCase()));
      const removedIdentifiers = oldList
        .map(s => (s.rollNo || s.identifier || '').trim().toUpperCase())
        .filter(id => id !== '' && !newIdentifiers.has(id));

      if (removedIdentifiers.length > 0) {
        body.$pullAll = body.$pullAll || {};
        body.$pull = body.$pull || {};
        
        body.$pullAll.completedMembers = removedIdentifiers;
        body.$pullAll.restrictedMembers = removedIdentifiers;
        
        body.$pull.activeParticipants = { 
          memberId: { $in: removedIdentifiers.map(i => new RegExp(`^${i}$`, 'i')) }
        };
        
        body.$pull.violations = {
          memberId: { $in: removedIdentifiers.map(i => new RegExp(`^${i}$`, 'i')) }
        };

        const mongoose = require('mongoose');
        const Submission = mongoose.models.Submission || mongoose.model('Submission');
        await Submission.deleteMany({
          contestId: id,
          memberId: { $in: removedIdentifiers.map(i => new RegExp(`^${i}$`, 'i')) }
        });
      }
    }

    const updatePayload = { $set: body };
    if (body.$pull) {
      updatePayload.$pull = body.$pull;
      delete body.$pull;
    }
    if (body.$pullAll) {
      updatePayload.$pullAll = body.$pullAll;
      delete body.$pullAll;
    }

    const updated = await Contest.findByIdAndUpdate(id, updatePayload, { returnDocument: 'after' });
    if (!updated) {
      return Response.json({ error: 'Contest not found' }, { status: 404 });
    }

    return Response.json(updated);
  } catch (error) {
    console.error('Error updating contest:', error);
    return Response.json({ error: 'Failed to update contest' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const authError = verifyAdmin(request);
  if (authError) return authError;

  try {
    const { id } = await params;

    await connectToDatabase();

    const deleted = await Contest.findByIdAndDelete(id);
    if (!deleted) {
      return Response.json({ error: 'Contest not found' }, { status: 404 });
    }

    return Response.json({ success: true, message: 'Contest deleted successfully' });
  } catch (error) {
    console.error('Error deleting contest:', error);
    return Response.json({ error: 'Failed to delete contest' }, { status: 500 });
  }
}
