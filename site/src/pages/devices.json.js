// The catalog as data. CC BY-SA. Nothing here is behind a signup.
import { devices } from "../lib/data.js";

export function GET() {
  return new Response(JSON.stringify({
    license: "CC-BY-SA-4.0",
    source: "https://dumbindex.com",
    generated: new Date().toISOString().slice(0, 10),
    count: devices.length,
    devices,
  }, null, 2), { headers: { "content-type": "application/json" } });
}
