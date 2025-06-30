const axios = require("axios");

exports.handler = async function (event) {
  const { email } = JSON.parse(event.body || "{}");

  if (!email) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "E-mail je povinný." }),
    };
  }

  try {
    // Krok 1: Získat seznam uživatelů
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

    const player = players.find((p) => p.tags?.email === email);

    if (!player) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Uživatel nenalezen." }),
      };
    }

    // Krok 2: Změnit tag
    await axios.put(
      `https://onesignal.com/api/v1/players/${player.id}`,
      {
        app_id: process.env.ONESIGNAL_APP_ID,
        tags: { subscribed: false },
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
      body: JSON.stringify({ message: "Uživatel odhlášen nastavením tagu." }),
    };
  } catch (error) {
    console.error("Chyba při odhlašování:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Chyba serveru", detail: error.message }),
    };
  }
};
