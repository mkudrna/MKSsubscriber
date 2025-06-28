// netlify/functions/subscribeEmail.js

exports.handler = async (event) => {
  const { email } = JSON.parse(event.body || "{}");

  if (!email) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing email" }) };
  }

  const response = await fetch("https://onesignal.com/api/v1/players", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${process.env.ONESIGNAL_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      app_id: process.env.ONESIGNAL_APP_ID,
      identifier: email,
      device_type: 11, // email
      notification_types: 1
    })
  });

  const result = await response.json();

  return {
    statusCode: response.status,
    body: JSON.stringify(result)
  };
};
