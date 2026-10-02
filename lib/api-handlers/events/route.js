
import { verifyAdmin } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Event from '@/models/Event';

export const revalidate = 60;

export async function GET() {
  try {
    await connectToDatabase();

    const events = await Event.find({}).sort({ date: 1 }).lean();
    return Response.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return Response.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request) {
  const authError = verifyAdmin(request);
  if (authError) return authError;
  try {
    const body = await request.json();
    const { title, date, time, location, description, imageUrl, status, customQuestions, formFields, regOpenDate, regCloseDate, registrationStatus } = body;

    if (!title || !date || !description) {
      return Response.json({ error: 'Title, date, and description are required' }, { status: 400 });
    }

    await connectToDatabase();

    const newEvent = await Event.create({
      title,
      date,
      time: time || '10:00 AM',
      location: location || 'Panimalar Engineering College',
      description,
      imageUrl: imageUrl || '/Events/DATAXSCAPE 2K26.jpeg',
      status: status || 'Upcoming',
      customQuestions: customQuestions || [],
      formFields: formFields || [],
      regOpenDate: regOpenDate || '',
      regCloseDate: regCloseDate || '',
      registrationStatus: registrationStatus || 'Auto'
    });

    return Response.json(newEvent, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return Response.json({ error: 'Failed to create event: ' + error.message }, { status: 500 });
  }
}
