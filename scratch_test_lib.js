// Load env vars
const fs = require("fs");
const path = require("path");

const envLocalPath = path.join(__dirname, ".env.local");
if (fs.existsSync(envLocalPath)) {
  const content = fs.readFileSync(envLocalPath, "utf8");
  content.split("\n").forEach(line => {
    const clean = line.trim();
    if (clean && !clean.startsWith("#")) {
      const idx = clean.indexOf("=");
      if (idx !== -1) {
        const k = clean.substring(0, idx).trim();
        const v = clean.substring(idx + 1).trim();
        process.env[k] = v;
      }
    }
  });
}

const { OrbitportSDK, createStorage } = require("@spacecomputer-io/orbitport-sdk-ts");

const storage = createStorage({
  type: "file",
  filePath: ".orbitport_token",
});

const sdk = new OrbitportSDK({
  config: {
    apiUrl: process.env.ORBITPORT_API_URL || "https://op.spacecomputer.io",
    authDomain: process.env.ORBITPORT_AUTH_DOMAIN || "auth.spacecomputer.io",
    clientId: process.env.ORBITPORT_CLIENT_ID,
    clientSecret: process.env.ORBITPORT_CLIENT_SECRET,
  },
  storage
});

sdk.setDebug(true);

sdk.ctrng.random({ src: "trng" })
  .then(res => {
    console.log("SUCCESS:", res.success);
    console.log("RAW DATA:", JSON.stringify(res, null, 2));
  })
  .catch(err => {
    console.error("ERROR:", err);
  });
