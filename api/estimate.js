export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  let body = {};

  try {
    // Vercel serverless requires explicit reading of req
    body = await new Promise((resolve, reject) => {
      let data = "";
      req.on("data", chunk => { data += chunk; });
      req.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(err);
        }
      });
    });
  } catch (err) {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  const { energy } = body;

  if (!energy) {
    return res.status(400).json({ error: "Missing energy parameter" });
  }

  const apiKey = process.env.CLIMATIQ_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Missing Climatiq API key" });
  }

  try {
    const response = await fetch("https://beta3.api.climatiq.io/estimate", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        emission_factor: {
          activity_id: "electricity-energy_source_grid_mix"
        },
        parameters: {
          energy: energy,
          energy_unit: "kWh"
        }
      })
    });

    const result = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: "Climatiq error", details: result });
    }

    return res.status(200).json(result);

  } catch (err) {
    return res.status(500).json({ error: "Failed to contact Climatiq", details: err.message });
  }
}
