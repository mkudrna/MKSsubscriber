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
    const response = await axios.get("https://onesignal.com/api/v1/players", {
      headers: {
        Authorization: `Basic ${process.env.ONESIGNAL_API_KEY}`,
      },
      params: {
        app_id: process.env.ONESIGNAL_APP_ID,
        limit: 300, // Adjust if needed
      },
    });

    const players = response.data.players || [];

    const player = players.find((p) => {
      const tags = p.tags || [];
      const tag = tags.find((t) => t.key === "email");
      return tag && tag.value === email;
    });

    if (!player) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Uživatel nenalezen." }),
      };
    }

    await axios.delete(
      `https://onesignal.com/api/v1/players/${player.id}?app_id=${process.env.ONESIGNAL_APP_ID}`,
      {
        headers: {
          Authorization: `Basic ${process.env.ONESIGNAL_API_KEY}`,
        },
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "E-mail byl odhlášen." }),
    };
  } catch (error) {
    console.error("Chyba při odhlašování:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Chyba serveru", detail: error.message }),
    };
  }
};
