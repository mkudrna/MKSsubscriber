const ONESIGNAL_APP_ID = "732781c6-651b-4e12-aa7a-64cacc82c61d"; // veřejný
const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY; // tajný

console.log("ONESIGNAL_API_KEY:", process.env.ONESIGNAL_API_KEY);

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
    // Získání všech zařízení
    const response = await axios.get("https://onesignal.com/api/v1/players", {
      headers: {
        Authorization: `Basic ${ONESIGNAL_API_KEY}`,
      },
      params: {
        app_id: ONESIGNAL_APP_ID,
        limit: 300,
      },
    });

    const players = response.data.players || [];

    // Hledání hráče podle e-mailu v tagu
    const player = players.find((p) => p.tags?.email === email);

    if (!player) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Uživatel nenalezen." }),
      };
    }

    // Odlášení = přepis tagu subscribed na false
    await axios.put(
      `https://onesignal.com/api/v1/players/${player.id}`,
      {
        app_id: ONESIGNAL_APP_ID,
        tags: { subscribed: false },
      },
      {
        headers: {
          Authorization: `Basic ${ONESIGNAL_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "E-mail byl odhlášen." }),
    };
  } catch (error) {
    console.error("Chyba při odhlašování:", error.response?.data || error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Chyba serveru",
        detail: error.response?.data || error.message,
      }),
    };
  }
};
