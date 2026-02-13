const BACKEND_BASE_URL = import.meta.env.VITE_NETFLIX_AUTH_BASE_URL || "";

export async function subscribePremium({
  planCode,
  cardHolderName,
  cardNumber,
  expiryMonth,
  expiryYear,
  cvv,
}) {
  const response = await fetch(`${BACKEND_BASE_URL}/api/payments/premium/subscribe`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      planCode,
      cardHolderName,
      cardNumber,
      expiryMonth,
      expiryYear,
      cvv,
    }),
  });

  let payload = {};
  try {
    payload = await response.json();
  } catch {
    payload = {};
  }

  if (!response.ok) {
    throw new Error(payload.message || `Payment request failed: ${response.status}`);
  }

  return payload;
}
