const axios = require("axios");

exports.handler = async function (event, context) {
  const { email } = JSON.parse(event.body || "{}");

  if (!email) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "E-mail je povinný." }),
    };
  }

  try {
    // 1. Získáme seznam hráčů
    const response = await axios.get("https://onesignal.com/api/v1/players", {
      headers: {
        Authorization: `Basic ${process.env.ONESIGNAL_API_KEY}`,
      },
      params: {
        app_id: process.env.ONESIGNAL_APP_ID,
        limit: 300,
      },
    });

    const players = response.data.players || [];

    // 2. Najdeme hráče podle tagu e-mailu
    const player = players.find((p) => {
      const tags = p.tags || {};
      return tags.email === email;
    });

    if (!player) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Uživatel nenalezen." }),
      };
    }

    // 3. "Odhlásíme" hráče (notification_types -2), odstraníme e-mail a přidáme flag
    await axios.put(
      `https://onesignal.com/api/v1/players/${player.id}`,
      {
        app_id: process.env.ONESIGNAL_APP_ID,
        notification_types: -2,
        tags: {
          email: `deleted-${Date.now()}@example.com`,
          subscribed: "false",
          deleted: "true"
        },
      },
      {
        headers: {
          Authorization: `Basic ${process.env.ONESIGNAL_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Uživatel byl anonymizován a odhlášen." }),
    };
  } catch (error) {
    console.error("Chyba při anonymizaci:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Chyba serveru", detail: error.message }),
    };
  }
};
