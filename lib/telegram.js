const GATEWAY_API_URL = 'https://gateway.telegram.org';

function getTelegramToken() {
  const token = process.env.TELEGRAM_GATEWAY_TOKEN;
  if (!token) {
    throw new Error('Missing TELEGRAM_GATEWAY_TOKEN environment variable.');
  }
  return token;
}

export async function sendVerificationCode(phoneNumber) {
  const token = getTelegramToken();
  const response = await fetch(`${GATEWAY_API_URL}/sendVerificationMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Telegram-Gateway-Token': token,
    },
    body: JSON.stringify({ phone_number: phoneNumber }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to send verification code.');
  }
  return data;
}

export async function checkVerificationCode(requestId, code, phoneNumber) {
  const token = getTelegramToken();
  const response = await fetch(`${GATEWAY_API_URL}/checkVerificationStatus`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Telegram-Gateway-Token': token,
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
