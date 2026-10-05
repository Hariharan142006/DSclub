
import { verifyAdmin } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Challenge from '@/models/Challenge';

export async function PUT(request, context) {
  const authError = verifyAdmin(request);
  if (authError) return authError;
  try {
    const { id } = await context.params;
    const body = await request.json();

    const type = body.type || 'code';
    if (body.codeDetails !== undefined || body.quizQuestions !== undefined || body.type !== undefined) {
      if (type === 'code') {
        body.quizQuestions = [];
      } else if (type === 'quiz') {
        body.codeDetails = {};
        if (body.quizQuestions) {
          body.quizQuestions = body.quizQuestions.filter(q => q && q.prompt && q.prompt.trim() !== '');
        }
      }
    }

    await connectToDatabase();

    const updatedChallenge = await Challenge.findByIdAndUpdate(id, body, { returnDocument: 'after' });
    if (!updatedChallenge) {
      return Response.json({ error: 'Challenge not found' }, { status: 404 });
    }

    return Response.json(updatedChallenge);
  } catch (error) {
    console.error('Error updating challenge:', error);
    return Response.json({ error: 'Failed to update challenge' }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  const authError = verifyAdmin(request);
  if (authError) return authError;
  try {
    const { id } = await context.params;

    await connectToDatabase();

    const deletedChallenge = await Challenge.findByIdAndDelete(id);
    if (!deletedChallenge) {
      return Response.json({ error: 'Challenge not found' }, { status: 404 });
    }

    return Response.json({ success: true, message: 'Challenge deleted successfully' });
  } catch (error) {
    console.error('Error deleting challenge:', error);
    return Response.json({ error: 'Failed to delete challenge' }, { status: 500 });
  }
}
