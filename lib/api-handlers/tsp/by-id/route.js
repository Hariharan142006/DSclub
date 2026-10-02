import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import TSP from '@/models/TSP';
import TSPSession from '@/models/TSPSession';
import { verifyAdmin } from '@/lib/auth';

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const tsp = await TSP.findById(id).lean();
    if (!tsp) {
      return NextResponse.json({ error: 'TSP not found' }, { status: 404 });
    }
    return NextResponse.json(tsp);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const authError = verifyAdmin(req);
  if (authError) return authError;

  try {
    const { id } = await params;
    await connectToDatabase();
    const data = await req.json();
    
    const oldTsp = await TSP.findById(id);
    if (!oldTsp) {
      return NextResponse.json({ error: 'TSP not found' }, { status: 404 });
    }

    // Cascade deletion: If whitelistedStudents is being updated, find who was removed
    if (data.whitelistedStudents !== undefined) {
      const oldList = oldTsp.whitelistedStudents || [];
      const newList = data.whitelistedStudents || [];
      
      // Find identifiers that were in old list but are NOT in the new list
      const newIdentifiers = new Set(newList.map(s => (s.rollNo || s.identifier || '').trim().toUpperCase()));
      const removedIdentifiers = oldList
        .map(s => (s.rollNo || s.identifier || '').trim().toUpperCase())
        .filter(id => id !== '' && !newIdentifiers.has(id));

      if (removedIdentifiers.length > 0) {
        // Scrub removed participants from all tracking arrays
        data.$pullAll = data.$pullAll || {};
        data.$pull = data.$pull || {};
        
        data.$pullAll.completedMembers = removedIdentifiers;
        data.$pullAll.restrictedMembers = removedIdentifiers;
        
        // Remove from activeParticipants
        data.$pull.activeParticipants = { 
          memberId: { $in: removedIdentifiers }
        };
        
        // Remove from violations
        data.$pull.violations = {
          memberId: { $in: removedIdentifiers }
        };

        // Delete their TSPSessions
        await TSPSession.deleteMany({
          tspId: id,
          memberId: { $in: removedIdentifiers }
        });
      }
    }

    // Prepare update payload
    const updatePayload = { $set: data };
    if (data.$pull) {
      updatePayload.$pull = data.$pull;
      delete data.$pull;
    }
    if (data.$pullAll) {
      updatePayload.$pullAll = data.$pullAll;
      delete data.$pullAll;
    }
    
    const tsp = await TSP.findByIdAndUpdate(id, updatePayload, { new: true });
    return NextResponse.json(tsp);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const authError = verifyAdmin(req);
  if (authError) return authError;

  try {
    const { id } = await params;
    await connectToDatabase();
    await TSP.findByIdAndDelete(id);
    await TSPSession.deleteMany({ tspId: id });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
