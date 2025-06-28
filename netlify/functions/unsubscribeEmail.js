// netlify/functions/unsubscribeEmail.js

exports.handler = async (event) => {
  const { email } = JSON.parse(event.body || "{}");

  if (!email) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing email" }) };
  }

  const listRes = await fetch(`https://onesignal.com/api/v1/players?app_id=${process.env.ONESIGNAL_APP_ID}`, {
    headers: {
      "Authorization": `Basic ${process.env.ONESIGNAL_API_KEY}`,
      "Content-Type": "application/json"
    }
  });

  const list = await listRes.json();
  const user = list.players.find(p => p.identifier === email);

  if (!user) {
    return { statusCode: 404, body: JSON.stringify({ error: "Email not found" }) };
  }

  const delRes = await fetch(`https://onesignal.com/api/v1/players/${user.id}?app_id=${process.env.ONESIGNAL_APP_ID}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Basic ${process.env.ONESIGNAL_API_KEY}`,
      "Content-Type": "application/json"
    }
  });

  return {
    statusCode: delRes.status,
    body: JSON.stringify({ message: "Deleted" })
  };
};
