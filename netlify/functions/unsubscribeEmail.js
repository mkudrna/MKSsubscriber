const axios = require("axios");

const APP_ID = "732781c6-651b-4e12-aa7a-64cacc82c61d"; // veřejné
const API_KEY = process.env.ONESIGNAL_API_KEY; // tajné
console.log("API KEY je:", API_KEY); // jen pro debug, pak SMAZAT!

exports.handler = async function (event) {
  const { email } = JSON.parse(event.body || "{}");

  if (!email) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "E-mail je povinný." }),
    };
  }

  try {
    console.info("📨 Hledám hráče podle e-mailu...");

    const response = await axios.get(`https://onesignal.com/api/v1/players`, {
      headers: {
        Authorization: `Basic ${API_KEY}`,
      },
      params: {
        app_id: APP_ID,
        limit: 300,
      },
    });

    const players = response.data.players || [];

    const player = players.find((p) => {
      const tags = p.tags || {};
      return tags.email === email;
    });

    if (!player) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "E-mail nebyl nalezen mezi odběrateli." }),
      };
    }

    console.info(`🗑 Mažu hráče ID: ${player.id}`);

    await axios.delete(
      `https://onesignal.com/api/v1/players/${player.id}`,
      {
        headers: {
          Authorization: `Basic ${API_KEY}`,
          "Content-Type": "application/json",
        },
        data: {
          app_id: APP_ID,
        },
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "E-mail úspěšně odhlášen." }),
    };
  } catch (error) {
    console.error("❌ Chyba při odhlašování:", error.response?.data || error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Chyba serveru",
        detail: error.response?.data || error.message,
      }),
    };
  }
};
