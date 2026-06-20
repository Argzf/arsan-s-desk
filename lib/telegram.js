/**
 * Telegram Gateway API client
 * Docs: https://core.telegram.org/gateway
 */

const GATEWAY_API_URL = 'https://gateway.telegram.org';

export async function sendVerificationCode(phoneNumber) {
  const response = await fetch(`${GATEWAY_API_URL}/sendVerificationMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Telegram-Gateway-Token': process.env.TELEGRAM_GATEWAY_TOKEN,
    },
    body: JSON.stringify({
      phone_number: phoneNumber,
      // Let Telegram generate the code automatically
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to send verification code.');
  }

  return data;
}

export async function checkVerificationCode(requestId, code, phoneNumber) {
  const response = await fetch(`${GATEWAY_API_URL}/checkVerificationStatus`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Telegram-Gateway-Token': process.env.TELEGRAM_GATEWAY_TOKEN,
    },
    body: JSON.stringify({
      request_id: requestId,
      code: code,
      phone_number: phoneNumber,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Invalid verification code.');
  }

  return data;
}
