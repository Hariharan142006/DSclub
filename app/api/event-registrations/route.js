
import { verifyAdmin } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import EventRegistration from '@/models/EventRegistration';

export async function GET(request) {
  const authError = verifyAdmin(request);
  if (authError) return authError;
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    await connectToDatabase();

    const query = eventId ? { eventId } : {};
    const registrations = await EventRegistration.find(query).sort({ createdAt: -1 });
    return Response.json(registrations);
  } catch (error) {
    console.error('Error fetching event registrations:', error);
    return Response.json({ error: 'Failed to fetch event registrations' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { eventId, eventTitle, name, email, rollNo, deptYear, customResponses, formResponses } = body;

    if (!eventId || !eventTitle) {
      return Response.json({ error: 'Missing event ID or Title' }, { status: 400 });
    }

    await connectToDatabase();

    const newReg = await EventRegistration.create({
      eventId,
      eventTitle,
      name: name || '',
      email: email || '',
      rollNo: rollNo || '',
      deptYear: deptYear || '',
      customResponses: customResponses || {},
      formResponses: formResponses || {},
      registeredAt: new Date(),
    });

    return Response.json(newReg, { status: 201 });
  } catch (error) {
    console.error('Error creating event registration:', error);
    return Response.json({ error: 'Failed to submit registration' }, { status: 500 });
  }
}
