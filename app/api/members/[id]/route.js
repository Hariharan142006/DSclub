
import { verifyAdmin } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Member from '@/models/Member';

export async function PUT(request, context) {
  const authError = verifyAdmin(request);
  if (authError) return authError;
  try {
    const { id } = await context.params;
    const body = await request.json();

    await connectToDatabase();

    const allowedFields = ['name', 'email', 'department', 'year', 'roleInterest', 'linkedin', 'github', 'score'];
    const sanitized = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) sanitized[key] = body[key];
    }

    const updatedMember = await Member.findOneAndUpdate(
      { $or: [{ _id: id }, { memberId: id }] },
      sanitized,
      { new: true }
    );

    if (!updatedMember) {
      return Response.json({ error: 'Member not found' }, { status: 404 });
    }

    return Response.json(updatedMember);
  } catch (error) {
    console.error('Error updating member:', error);
    return Response.json({ error: 'Failed to update member' }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  const authError = verifyAdmin(request);
  if (authError) return authError;
  try {
    const { id } = await context.params;

    await connectToDatabase();

    const deletedMember = await Member.findOneAndDelete({ $or: [{ _id: id }, { memberId: id }] });
    if (!deletedMember) {
      return Response.json({ error: 'Member not found' }, { status: 404 });
    }

    return Response.json({ success: true, message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Error deleting member:', error);
    return Response.json({ error: 'Failed to delete member' }, { status: 500 });
  }
}
