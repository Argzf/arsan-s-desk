import { getSubmissions } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('admin_auth')?.value;

    if (authToken !== 'authenticated') {
      return Response.json(
        { error: 'Unauthorized.' },
        { status: 401 }
      );
    }

    const submissions = await getSubmissions();
    return Response.json({ submissions });
  } catch (error) {
    console.error('Fetch error:', error);
    return Response.json(
      { error: error.message || 'Failed to fetch submissions.' },
      { status: 500 }
    );
  }
}

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
      console.error('ADMIN_PASSWORD not set.');
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
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return Response.json(
      { error: error.message || 'Failed to login.' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const response = Response.json({ success: true });
    response.cookies.set('admin_auth', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return Response.json(
      { error: error.message || 'Failed to logout.' },
      { status: 500 }
    );
  }
}
