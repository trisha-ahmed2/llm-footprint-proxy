export const config = {
  runtime: "nodejs"
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  // Read raw request body as text
  const rawBody = await new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
  });

  let body = {};
  try {
    body = JSON.parse(rawBody || "{}");
  } catch {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  const { energy, energy_unit = "kWh" } = body;

  if (!energy) {
    return res.status(400).json({ error: "Missing energy parameter" });
  }

  const payload = {
    emission_factor: { activity_id: "electricity-energy_source_grid_mix" },
    parameters: { energy, energy_unit }
  };

  try {
    const climatiqRes = await fetch("https://beta3.api.climatiq.io/estimate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CLIMATIQ_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await climatiqRes.json();

    return res.status(climatiqRes.status).json(data);
  } catch (err) {
    return res.status(500).json({
      error: "Failed to contact Climatiq",
      details: err.message,
    });
  }
}
