import { sendVerificationCode } from '@/lib/telegram';

export async function POST(request) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return Response.json(
        { error: 'Phone number is required.' },
        { status: 400 }
      );
    }

    // Basic E.164 format validation
    if (!phone.match(/^\+[1-9]\d{1,14}$/)) {
      return Response.json(
        { error: 'Phone number must be in E.164 format (e.g., +1234567890).' },
        { status: 400 }
      );
    }

    const result = await sendVerificationCode(phone);

    return Response.json({
      success: true,
      request_id: result.request_id,
    });
  } catch (error) {
    console.error('Verification error:', error);
    return Response.json(
      { error: error.message || 'Failed to send verification code.' },
      { status: 500 }
    );
  }
}
