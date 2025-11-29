export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { energy_kwh } = req.body;

    const climatiqRes = await fetch("https://beta3.api.climatiq.io/estimate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CLIMATIQ_API_KEY}`
      },
      body: JSON.stringify({
        emission_factor: { activity_id: "electricity-energy_source_grid_mix" },
        parameters: {
          energy: energy_kwh,
          energy_unit: "kWh"
        }
      })
    });

    const data = await climatiqRes.json();
    return res.status(200).json(data);

  } catch (err) {
    console.error("Proxy error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
