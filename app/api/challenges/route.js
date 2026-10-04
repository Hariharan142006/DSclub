
import { verifyAdmin } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Challenge from '@/models/Challenge';

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export async function GET(request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 100;
    const skip = (page - 1) * limit;

    const total = await Challenge.countDocuments({});
    const challenges = await Challenge.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
    const totalPages = Math.ceil(total / limit);

    if (searchParams.has('page') || searchParams.has('paginate')) {
      return Response.json({ challenges, total, page, totalPages }, { headers: noCacheHeaders });
    }

    return Response.json(challenges, { headers: noCacheHeaders });
  } catch (error) {
    console.error('Error fetching challenges:', error);
    return Response.json({ error: 'Failed to fetch challenges' }, { status: 500 });
  }
}

export async function POST(request) {
  const authError = verifyAdmin(request);
  if (authError) return authError;
  try {
    const body = await request.json();
    const { title, description, type, difficulty, points, codeDetails, quizQuestions } = body;

    if (!title || !description || !type) {
      return Response.json({ error: 'Title, description, and type are required' }, { status: 400 });
    }

    const cleanedCodeDetails = type === 'code' ? (codeDetails || {}) : {};
    const cleanedQuizQuestions = type === 'quiz' ? (quizQuestions || []).filter(q => q && q.prompt && q.prompt.trim() !== '') : [];

    if (type === 'quiz' && cleanedQuizQuestions.length === 0) {
      return Response.json({ error: 'At least one valid quiz question with a prompt is required for Quiz challenges' }, { status: 400 });
    }

    await connectToDatabase();

    const newChallenge = await Challenge.create({
      title,
      description,
      type,
      difficulty: difficulty || 'Medium',
      points: points || 50,
      isHidden: body.isHidden || false,
      codeDetails: cleanedCodeDetails,
      quizQuestions: cleanedQuizQuestions
    });

    return Response.json(newChallenge, { status: 201 });
  } catch (error) {
    console.error('Error creating challenge:', error);
    return Response.json({ error: 'Failed to create challenge: ' + error.message }, { status: 500 });
  }
}
