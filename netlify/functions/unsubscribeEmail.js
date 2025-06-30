const axios = require("axios");

const ONESIGNAL_APP_ID = "732781c6-651b-4e12-aa7a-64cacc82c61d"; // veřejný
const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY; // tajný

exports.handler = async function (event) {
  const { email } = JSON.parse(event.body || "{}");

  if (!email) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "E-mail je povinný." }),
    };
  }

  try {
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
    const player = players.find((p) => p.tags && p.tags.email === email);

    if (!player) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "E-mail nebyl nalezen." }),
      };
    }

    const sub = (player.subscriptions || []).find(
      (s) => s.type === "email" && s.contact === email
    );

    if (!sub) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "E-mailová subskripce nenalezena." }),
      };
    }

    await axios.delete(
      `https://onesignal.com/api/v1/apps/${ONESIGNAL_APP_ID}/subscriptions/${sub.id}`,
      {
        headers: {
          Authorization: `Basic ${ONESIGNAL_API_KEY}`,
        },
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "E-mailový odběr byl úspěšně zrušen." }),
    };
  } catch (error) {
    console.error("Chyba při odhlašování:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Chyba serveru", detail: error.message }),
    };
  }
};
