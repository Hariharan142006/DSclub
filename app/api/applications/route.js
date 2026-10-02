
import { verifyAdmin } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Application from '@/models/Application';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  const authError = verifyAdmin(request);
  if (authError) return authError;
  try {
    await connectToDatabase();
    const applications = await Application.find({}).sort({ createdAt: -1 });
    return Response.json(applications || []);
  } catch (error) {
    console.error('Error fetching applications:', error);
    return Response.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, year, department, interest } = body;

    if (!name || !email) {
      return Response.json({ error: 'Name and Email are required' }, { status: 400 });
    }

    await connectToDatabase();

    const newApplication = await Application.create({
      name: name.trim(),
      email: email.trim(),
      year: year || '1st Year',
      department: department || 'AI & Data Science',
      interest: interest || '',
      status: 'Pending',
      memberId: null,
    });

    return Response.json({ success: true, application: newApplication }, { status: 201 });
  } catch (error) {
    console.error('Error submitting application:', error);
    return Response.json({ error: 'Failed to submit application: ' + error.message }, { status: 500 });
  }
}
