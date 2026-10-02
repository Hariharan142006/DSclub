import { NextResponse } from 'next/server';

// Static imports of all API route handlers
import * as adminAuth from '@/lib/api-handlers/admin/auth/route';
import * as adminAuthVerify from '@/lib/api-handlers/admin/auth/verify/route';

import * as applications from '@/lib/api-handlers/applications/route';
import * as applicationById from '@/lib/api-handlers/applications/by-id/route';

import * as challenges from '@/lib/api-handlers/challenges/route';
import * as challengesSubmit from '@/lib/api-handlers/challenges/submit/route';
import * as challengeById from '@/lib/api-handlers/challenges/by-id/route';

import * as contests from '@/lib/api-handlers/contests/route';
import * as contestsPreviewCert from '@/lib/api-handlers/contests/preview-certificate/route';
import * as contestsRestrict from '@/lib/api-handlers/contests/restrict/route';
import * as contestsViolation from '@/lib/api-handlers/contests/violation/route';
import * as contestById from '@/lib/api-handlers/contests/by-id/route';
import * as contestComplete from '@/lib/api-handlers/contests/by-id/complete/route';
import * as contestJoin from '@/lib/api-handlers/contests/by-id/join/route';
import * as contestLeaderboard from '@/lib/api-handlers/contests/by-id/leaderboard/route';
import * as contestSendCerts from '@/lib/api-handlers/contests/by-id/send-certificates/route';
import * as contestSubmissions from '@/lib/api-handlers/contests/by-id/submissions/route';

import * as eventRegistrations from '@/lib/api-handlers/event-registrations/route';

import * as events from '@/lib/api-handlers/events/route';
import * as eventById from '@/lib/api-handlers/events/by-id/route';

import * as leaderboard from '@/lib/api-handlers/leaderboard/route';
import * as leaderboardReset from '@/lib/api-handlers/leaderboard/reset/route';

import * as members from '@/lib/api-handlers/members/route';
import * as membersBulk from '@/lib/api-handlers/members/bulk/route';
import * as membersVerify from '@/lib/api-handlers/members/verify/route';
import * as memberById from '@/lib/api-handlers/members/by-id/route';

import * as seedQuizzes from '@/lib/api-handlers/seed-quizzes/route';
import * as settings from '@/lib/api-handlers/settings/route';

import * as tsp from '@/lib/api-handlers/tsp/route';
import * as tspJoin from '@/lib/api-handlers/tsp/join/route';
import * as tspPreviewCert from '@/lib/api-handlers/tsp/preview-certificate/route';
import * as tspRestrict from '@/lib/api-handlers/tsp/restrict/route';
import * as tspById from '@/lib/api-handlers/tsp/by-id/route';
import * as tspComplete from '@/lib/api-handlers/tsp/by-id/complete/route';
import * as tspLeaderboard from '@/lib/api-handlers/tsp/by-id/leaderboard/route';
import * as tspReport from '@/lib/api-handlers/tsp/by-id/report/route';
import * as tspSendCerts from '@/lib/api-handlers/tsp/by-id/send-certificates/route';
import * as tspSubmissions from '@/lib/api-handlers/tsp/by-id/submissions/route';

import * as upload from '@/lib/api-handlers/upload/route';

function resolveRoute(slug = []) {
  if (!slug || slug.length === 0) {
    return null;
  }

  const [s0, s1, s2] = slug;

  // admin
  if (s0 === 'admin') {
    if (s1 === 'auth') {
      if (!s2) return { handler: adminAuth, params: {} };
      if (s2 === 'verify') return { handler: adminAuthVerify, params: {} };
    }
  }

  // applications
  if (s0 === 'applications') {
    if (!s1) return { handler: applications, params: {} };
    return { handler: applicationById, params: { id: s1 } };
  }

  // challenges
  if (s0 === 'challenges') {
    if (!s1) return { handler: challenges, params: {} };
    if (s1 === 'submit') return { handler: challengesSubmit, params: {} };
    return { handler: challengeById, params: { id: s1 } };
  }

  // contests
  if (s0 === 'contests') {
    if (!s1) return { handler: contests, params: {} };
    if (s1 === 'preview-certificate') return { handler: contestsPreviewCert, params: {} };
    if (s1 === 'restrict') return { handler: contestsRestrict, params: {} };
    if (s1 === 'violation') return { handler: contestsViolation, params: {} };

    // contests/:id/...
    const id = s1;
    if (!s2) return { handler: contestById, params: { id } };
    if (s2 === 'complete') return { handler: contestComplete, params: { id } };
    if (s2 === 'join') return { handler: contestJoin, params: { id } };
    if (s2 === 'leaderboard') return { handler: contestLeaderboard, params: { id } };
    if (s2 === 'send-certificates') return { handler: contestSendCerts, params: { id } };
    if (s2 === 'submissions') return { handler: contestSubmissions, params: { id } };
  }

  // event-registrations
  if (s0 === 'event-registrations') {
    return { handler: eventRegistrations, params: {} };
  }

  // events
  if (s0 === 'events') {
    if (!s1) return { handler: events, params: {} };
    return { handler: eventById, params: { id: s1 } };
  }

  // leaderboard
  if (s0 === 'leaderboard') {
    if (!s1) return { handler: leaderboard, params: {} };
    if (s1 === 'reset') return { handler: leaderboardReset, params: {} };
  }

  // members
  if (s0 === 'members') {
    if (!s1) return { handler: members, params: {} };
    if (s1 === 'bulk') return { handler: membersBulk, params: {} };
    if (s1 === 'verify') return { handler: membersVerify, params: {} };
    return { handler: memberById, params: { id: s1 } };
  }

  // seed-quizzes
  if (s0 === 'seed-quizzes') {
    return { handler: seedQuizzes, params: {} };
  }

  // settings
  if (s0 === 'settings') {
    return { handler: settings, params: {} };
  }

  // tsp
  if (s0 === 'tsp') {
    if (!s1) return { handler: tsp, params: {} };
    if (s1 === 'join') return { handler: tspJoin, params: {} };
    if (s1 === 'preview-certificate') return { handler: tspPreviewCert, params: {} };
    if (s1 === 'restrict') return { handler: tspRestrict, params: {} };

    // tsp/:id/...
    const id = s1;
    if (!s2) return { handler: tspById, params: { id } };
    if (s2 === 'complete') return { handler: tspComplete, params: { id } };
    if (s2 === 'leaderboard') return { handler: tspLeaderboard, params: { id } };
    if (s2 === 'report') return { handler: tspReport, params: { id } };
    if (s2 === 'send-certificates') return { handler: tspSendCerts, params: { id } };
    if (s2 === 'submissions') return { handler: tspSubmissions, params: { id } };
  }

  // upload
  if (s0 === 'upload') {
    return { handler: upload, params: {} };
  }

  return null;
}

async function handle(request, context) {
  try {
    const rawParams = (await context?.params) || {};
    const slug = rawParams.slug || [];
    const match = resolveRoute(slug);

    if (!match) {
      return NextResponse.json({ error: `Not found: /api/${slug.join('/')}` }, { status: 404 });
    }

    const { handler, params } = match;
    const method = request.method;
    const routeFn = handler[method];

    if (!routeFn) {
      return NextResponse.json(
        { error: `Method ${method} not allowed for /api/${slug.join('/')}` },
        { status: 405 }
      );
    }

    // Support both await params and direct params property access
    const paramPromise = Promise.resolve(params);
    Object.assign(paramPromise, params);

    return await routeFn(request, { params: paramPromise });
  } catch (error) {
    console.error('API router error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const DELETE = handle;
export const PATCH = handle;
export const HEAD = handle;
export const OPTIONS = handle;
