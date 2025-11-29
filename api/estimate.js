export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Parse JSON body safely
  let body = {};
  try {
    body = req.body || JSON.parse(req.body || "{}");
  } catch (e) {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  const { energy } = body;

  if (!energy) {
    return res.status(400).json({ error: "Missing energy parameter" });
  }

  // Build Climatiq payload
  const payload = {
    emission_factor: { activity_id: "electricity-energy_source_grid_mix" },
    parameters: { energy, energy_unit: "kWh" }
  };

  try {
    const climatiqRes = await fetch("https://beta3.api.climatiq.io/estimate", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.CLIMATIQ_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await climatiqRes.json();

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: "Failed to contact Climatiq", details: err.message });
  }
}
