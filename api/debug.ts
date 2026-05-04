import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const token = process.env.APIBRASIL_KEY;
  if (!token) return res.status(200).json({ error: "APIBRASIL_KEY missing" });

  const plate = (req.query.plate as string) || "GYP8H83";

  const apiRes = await fetch("https://gateway.apibrasil.io/api/v2/consulta/veiculos/credits", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ placa: plate }),
    signal: AbortSignal.timeout(15_000),
  });

  const body = await apiRes.text();
  return res.status(200).json({
    token_prefix: token.slice(0, 20) + "...",
    api_status: apiRes.status,
    api_body: JSON.parse(body),
  });
}
