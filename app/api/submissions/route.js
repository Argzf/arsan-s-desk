import { getSubmissions } from '@/lib/db';
import { cookies } from 'next/headers';

// GET: Fetch all submissions (admin only)
export async function GET() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('admin_auth')?.value;

  if (authToken !== 'authenticated') {
    return Response.json(
      { error: 'Unauthorized.' },
      { status: 401 }
    );
  }

  try {
    const submissions = await getSubmissions();
    return Response.json({ submissions });
  } catch (error) {
    console.error('Fetch error:', error);
    return Response.json(
      { error: 'Failed to fetch submissions.' },
      { status: 500 }
    );
  }
}

// POST: Login (set auth cookie)
export async function POST(request) {
  try {
    const { password } = await request.json();

    if (!password) {
      return Response.json(
        { error: 'Password is required.' },
        { status: 400 }
      );
    }

    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.error('ADMIN_PASSWORD not set in environment variables.');
      return Response.json(
        { error: 'Server configuration error.' },
        { status: 500 }
      );
    }

    if (password !== adminPassword) {
      return Response.json(
        { error: 'Invalid password.' },
        { status: 401 }
      );
    }

    const response = Response.json({ success: true });

    response.cookies.set('admin_auth', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return Response.json(
      { error: 'Failed to login.' },
      { status: 500 }
    );
  }
}

// DELETE: Logout (clear auth cookie)
export async function DELETE() {
  const response = Response.json({ success: true });

  response.cookies.set('admin_auth', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}
