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

    const { access_token } = await tokenRes.json();

    // On liste tous les formulaires pour trouver le bon type
    const formsRes = await fetch(
      `https://api.helloasso.com/v5/organizations/${ORG_SLUG}/forms`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    const formsText = await formsRes.text();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: formsText,
    };

  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message }),
    };
  }
};
