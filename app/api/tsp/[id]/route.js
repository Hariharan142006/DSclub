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
    
    // In Mongoose strict: false mode, updating $set persists all valid TSP fields
    const tsp = await TSP.findByIdAndUpdate(id, { $set: data }, { new: true });
    if (!tsp) {
      return NextResponse.json({ error: 'TSP not found' }, { status: 404 });
    }
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
