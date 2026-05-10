exports.handler = async () => {
  const CLIENT_ID     = process.env.HELLOASSO_CLIENT_ID;
  const CLIENT_SECRET = process.env.HELLOASSO_CLIENT_SECRET;
  const ORG_SLUG      = process.env.HELLOASSO_ORG_SLUG;
  const FORM_SLUG     = process.env.HELLOASSO_FORM_SLUG;

  const GOAL = 350000;

  try {
    const tokenRes = await fetch("https://api.helloasso.com/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type:    "client_credentials",
        client_id:     CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      return { statusCode: 502, body: JSON.stringify({ error: "Token failed", detail: err }) };
    }

    const { access_token } = await tokenRes.json();

    const statsRes = await fetch(
      `https://api.helloasso.com/v5/organizations/${ORG_SLUG}/forms/Donation/${FORM_SLUG}/statistics`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    if (!statsRes.ok) {
      const err = await statsRes.text();
      return { statusCode: 502, body: JSON.stringify({ error: "Stats failed", detail: err }) };
    }

    const stats = await statsRes.json();
    const amountCents = stats.totalAmount ?? stats.amountCollected ?? 0;
    const amount      = Math.round(amountCents / 100);
    const pct         = Math.round((amount / GOAL) * 100);

    return {
      statusCode: 200,
      headers: {
        "Content-Type":                "application/json",
        "Cache-Control":               "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ amount, goal: GOAL, pct }),
    };

  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message }),
    };
  }
};
