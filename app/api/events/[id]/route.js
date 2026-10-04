
import { verifyAdmin } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Event from '@/models/Event';


export async function PUT(request, context) {
  const authError = verifyAdmin(request);
  if (authError) return authError;
  try {
    const { id } = await context.params;
    const body = await request.json();

    await connectToDatabase();

    const updatedEvent = await Event.findByIdAndUpdate(id, body, { new: true });
    if (!updatedEvent) {
      return Response.json({ error: 'Event not found' }, { status: 404 });
    }

    return Response.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    return Response.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  const authError = verifyAdmin(request);
  if (authError) return authError;
  try {
    const { id } = await context.params;

    await connectToDatabase();

    const deletedEvent = await Event.findByIdAndDelete(id);
    if (!deletedEvent) {
      return Response.json({ error: 'Event not found' }, { status: 404 });
    }

    return Response.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    return Response.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
