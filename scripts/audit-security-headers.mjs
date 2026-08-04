const baseUrl = (process.env.SECURITY_AUDIT_URL ?? "https://pnyx-psi.vercel.app").replace(/\/$/, "");
const expected = {
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=()",
  "strict-transport-security": "max-age=31536000; includeSubDomains",
};

const response = await fetch(baseUrl, { redirect: "manual" });
if (!response.ok) throw new Error(`Security header audit failed: ${baseUrl} returned HTTP ${response.status}.`);
const missing = Object.entries(expected).filter(([header, value]) => response.headers.get(header) !== value);
if (missing.length) {
  for (const [header, value] of missing) console.error(`${header}: expected ${value}; received ${response.headers.get(header) ?? "missing"}`);
  process.exitCode = 1;
} else {
  console.log(`Security headers verified for ${baseUrl} (HTTP ${response.status}).`);
}