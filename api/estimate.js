export default async function handler(req, res) {
  const { energy } = req.query;

  if (!energy) {
    return res.status(400).json({ error: "Missing energy parameter" });
  }

  try {
    const response = await fetch("https://beta3.api.climatiq.io/estimate", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.CLIMATIQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        emission_factor: {
          activity_id: "electricity-energy_source_grid_mix"
        },
        parameters: {
          energy: Number(energy),
          energy_unit: "kWh"
        }
      })
    });

    const data = await response.json();
    return res.status(200).json(data);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch from Climatiq" });
  }
}
