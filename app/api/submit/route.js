import { createSubmission } from '@/lib/db';

export async function POST(request) {
  try {
    const { title, message, phone, instagram, verified } = await request.json();

    if (!message) {
      return Response.json(
        { error: 'Message is required.' },
        { status: 400 }
      );
    }

    if (!phone) {
      return Response.json(
        { error: 'Phone number is required.' },
        { status: 400 }
      );
    }

    if (!verified) {
      return Response.json(
        { error: 'Phone number must be verified before submitting.' },
        { status: 400 }
      );
    }

    await createSubmission({ title, message, phone, instagram });

    return Response.json({
      success: true,
      message: 'Submission created successfully.',
    });
  } catch (error) {
    console.error('Submission error:', error);
    return Response.json(
      { error: 'Failed to create submission.' },
      { status: 500 }
    );
  }
}
