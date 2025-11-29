// force redeploy 2

export const config = {
  runtime: "nodejs"
};

export default async function handler(req, res) {
  console.log("METHOD:", req.method);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const rawBody = await new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
  });

  console.log("RAW BODY:", rawBody);

  let body = {};
  try {
    body = JSON.parse(rawBody || "{}");
  } catch (e) {
    console.error("JSON PARSE ERROR:", e);
    return res.status(400).json({ error: "Invalid JSON", details: e.message });
  }

  console.log("PARSED BODY:", body);

  const { energy, energy_unit = "kWh" } = body;

  if (!energy) {
    console.log("ENERGY MISSING");
    return res.status(400).json({ error: "Missing energy parameter" });
  }

  console.log("CLIMATIQ_KEY:", process.env.CLIMATIQ_KEY);

  const payload = {
    emission_factor: {
      activity_id: "electricity-consumption_grid_mix",
      data_version: "28.28"
    },
    parameters: {
      energy,
      energy_unit
    }
  };

  try {
    console.log("SENDING PAYLOAD:", payload);

    const climatiqRes = await fetch("https://api.climatiq.io/estimate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CLIMATIQ_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log("CLIMATIQ STATUS:", climatiqRes.status);

    const data = await climatiqRes.text();
    console.log("CLIMATIQ RESPONSE RAW:", data);

    return res.status(climatiqRes.status).send(data);
  } catch (err) {
    console.error("FETCH ERROR:", err);
    return res.status(500).json({
      error: "Failed to contact Climatiq",
      details: err.message,
    });
  }
}
