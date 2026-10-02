
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

    const updated = await Contest.findByIdAndUpdate(id, { $set: body }, { new: true });
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
