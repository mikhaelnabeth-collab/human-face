exports.handler = async () => {
  const CLIENT_ID   = process.env.HELLOASSO_CLIENT_ID;
  const CLIENT_SECRET = process.env.HELLOASSO_CLIENT_SECRET;
  const ORG_SLUG    = process.env.HELLOASSO_ORG_SLUG;
  const FORM_SLUG   = process.env.HELLOASSO_FORM_SLUG;
  const GOAL        = 350000;
  const BASE_AMOUNT = 39000;

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

    const { access_token } = await tokenRes.json();

    const res  = await fetch(
      `https://api.helloasso.com/v5/organizations/${ORG_SLUG}/forms/Donation/${FORM_SLUG}/payments?pageSize=20`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    const data = await res.json();

    let onlineCents = 0;
    const donors = [];

    for (const payment of data.data || []) {
      if (payment.state === "Authorized" || payment.state === "Processed") {
        onlineCents += payment.amount || 0;
const firstName = payment.payer?.firstName || "";
const lastInitial = payment.payer?.lastName ? payment.payer.lastName[0] + "." : "";
const name = payment.payer?.isAnonymous
  ? "Donateur anonyme"
  : `${firstName} ${lastInitial}`.trim();
        donors.push({
          name,
          amount: Math.round((payment.amount || 0) / 100),
          date: payment.date,
        });
      }
    }

    const amount = BASE_AMOUNT + Math.round(onlineCents / 100);
    const pct    = Math.round((amount / GOAL) * 100);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ amount, goal: GOAL, pct, donors }),
    };

  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message }),
    };
  }
};
