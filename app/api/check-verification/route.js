import { checkVerificationCode } from '@/lib/telegram';

export async function POST(request) {
  try {
    const { request_id, code, phone } = await request.json();

    if (!request_id || !code || !phone) {
      return Response.json(
        { error: 'Request ID, code, and phone are required.' },
        { status: 400 }
      );
    }

    const result = await checkVerificationCode(request_id, code, phone);

    if (result.status !== 'ok') {
      return Response.json(
        { error: 'Invalid verification code.' },
        { status: 400 }
      );
    }

    return Response.json({
      success: true,
      verified: true,
    });
  } catch (error) {
    console.error('Check verification error:', error);
    return Response.json(
      { error: error.message || 'Failed to verify code.' },
      { status: 500 }
    );
  }
}
