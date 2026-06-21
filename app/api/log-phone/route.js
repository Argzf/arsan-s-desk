import { headers } from 'next/headers';

export async function POST(request) {
  try {
    const { phone } = await request.json();
    if (!phone) {
      return Response.json({ error: 'Phone required' }, { status: 400 });
    }

    const headersList = await headers();
    const forwarded = headersList.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : headersList.get('x-real-ip') || 'unknown';

    const webhookUrl = process.env.dc_wh_ag_desk;
    if (!webhookUrl) {
      console.error('Discord webhook URL not configured');
      return Response.json({ success: false, error: 'Webhook not configured' }, { status: 200 });
    }

    const discordPayload = {
      embeds: [
        {
          title: '📞 Phone Number Logged',
          color: 0x5865F2,
          fields: [
            { name: 'Phone', value: phone, inline: true },
            { name: 'IP Address', value: ip, inline: true },
            { name: 'Timestamp', value: new Date().toISOString(), inline: false },
          ],
          footer: { text: "Arsan's Desk - Pre-verification logging" },
        },
      ],
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(discordPayload),
    });

    if (!response.ok) {
      throw new Error(`Discord responded with ${response.status}`);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ success: false, error: 'Logging failed' }, { status: 200 });
  }
}
