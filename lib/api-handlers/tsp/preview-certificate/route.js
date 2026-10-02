import { generateContestCertificatePdf } from '@/lib/email';
import { verifyAdmin } from '@/lib/auth';

export async function POST(request) {
  const authError = verifyAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { tsp, contest, member } = body || {};
    const competition = tsp || contest;

    if (!competition) {
      return Response.json({ error: 'TSP/Contest data is required for preview' }, { status: 400 });
    }

    // Default sample member if none provided
    const sampleMember = member || {
      name: 'ALEX RIVERA',
      memberId: 'DSCAI2026',
      email: 'alex.rivera@pec.edu',
      department: 'AI & DATA SCIENCE',
      year: '3rd Year'
    };

    const pdfBuffer = await generateContestCertificatePdf(sampleMember, competition, 0, 1);

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="tsp_certificate_preview.pdf"',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error generating TSP certificate preview PDF:', error);
    return Response.json({ error: 'Failed to generate certificate preview: ' + error.message }, { status: 500 });
  }
}
