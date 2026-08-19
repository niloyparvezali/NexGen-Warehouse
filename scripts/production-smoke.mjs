const base = (process.argv[2] || process.env.API_URL || "http://localhost:5000").replace(/\/$/, "");

const checks = [
  ["health", "/health", 200],
  ["readiness", "/ready", 200],
];

let failed = false;
for (const [name, path, expected] of checks) {
  try {
    const response = await fetch(`${base}${path}`);
    const body = await response.text();
    if (response.status !== expected) {
      failed = true;
      console.error(`FAIL ${name}: expected ${expected}, received ${response.status}`);
      continue;
    }
    console.log(`PASS ${name}: ${response.status} ${body.slice(0, 160)}`);
  } catch (error) {
    failed = true;
    console.error(`FAIL ${name}: ${error.message}`);
  }
}

if (failed) process.exit(1);
console.log("Production smoke checks passed.");
