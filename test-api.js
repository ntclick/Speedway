const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('.env.local not found!');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx < 0) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  const val = trimmed.slice(eqIdx + 1).trim();
  env[key] = val;
}

console.log('=== ENV LOADED ===');
console.log('CLIENT_ID:', env.ORBITPORT_CLIENT_ID ? env.ORBITPORT_CLIENT_ID.slice(0, 8) + '...' : 'MISSING');
console.log('CLIENT_SECRET:', env.ORBITPORT_CLIENT_SECRET ? '***' : 'MISSING');
console.log('API_URL:', env.ORBITPORT_API_URL);
console.log('AUTH_DOMAIN:', env.ORBITPORT_AUTH_DOMAIN);
console.log('');

async function main() {
  const { OrbitportSDK, createStorage } = require('@spacecomputer-io/orbitport-sdk-ts');

  const storage = createStorage({ type: 'file', filePath: '.orbitport_token' });

  const sdk = new OrbitportSDK({
    config: {
      apiUrl: env.ORBITPORT_API_URL || 'https://op.spacecomputer.io',
      authDomain: env.ORBITPORT_AUTH_DOMAIN || 'auth.spacecomputer.io',
      clientId: env.ORBITPORT_CLIENT_ID,
      clientSecret: env.ORBITPORT_CLIENT_SECRET,
    },
    storage,
  });

  sdk.setDebug(true);

  console.log('=== TESTING cTRNG.random() ===');
  try {
    const result = await sdk.ctrng.random();
    console.log('\nRaw cTRNG result keys:', Object.keys(result || {}));
    const data = result?.data;
    console.log('\nresult.data keys:', data ? Object.keys(data) : 'null');
    console.log('randomHex (result.data.data):', data?.data ? data.data.slice(0, 32) + '...' : 'MISSING');
    console.log('source (result.data.src):', data?.src);
    console.log('service:', data?.service);
    console.log('signature:', JSON.stringify(data?.signature, null, 2));
    console.log('timestamp:', data?.timestamp);
    console.log('metadata:', JSON.stringify(result?.metadata, null, 2));
    console.log('\n==> cTRNG SUCCESS');
  } catch (err) {
    console.error('\n==> cTRNG FAILED:', err.message);
  }

  console.log('\n=== TESTING KMS ===');
  try {
    // Check existing key
    const kmsKeyPath = path.join(__dirname, 'kms-key.json');
    let keyId = null;
    if (fs.existsSync(kmsKeyPath)) {
      const kd = JSON.parse(fs.readFileSync(kmsKeyPath, 'utf8'));
      keyId = kd.keyId;
      console.log('Existing KMS key:', keyId);
      console.log('Existing publicKey:', kd.publicKey ? kd.publicKey.slice(0, 32) + '...' : 'NULL');
    }

    if (!keyId) {
      console.log('Creating new KMS key...');
      const createRes = await sdk.kms.createKey({
        alias: `orbit-test-${Date.now()}`,
        keySpec: 'ECDSA_P256',
        keyUsage: 'SIGN_VERIFY',
        scheme: 'TRANSIT',
        description: 'Test KMS Key',
        tags: [],
      });
      console.log('createKey result:', JSON.stringify(createRes, null, 2));
      keyId = createRes?.data?.KeyMetadata?.KeyId;
    }

    if (keyId) {
      console.log('\nFetching public key for:', keyId);
      try {
        const pkRes = await sdk.kms.getPublicKey({ keyId });
        console.log('getPublicKey result:', JSON.stringify(pkRes, null, 2));
      } catch (pkErr) {
        console.error('getPublicKey error:', pkErr.message);
        // Try listing available kms methods
        console.log('Available kms methods:', Object.keys(sdk.kms || {}));
      }

      console.log('\nSigning test message...');
      const signRes = await sdk.kms.sign({
        keyId,
        message: 'OrbitRush:Test=Car#1,Wager=100,Seed=abc123',
        signingAlgorithm: 'ECDSA_SHA_256',
      });
      console.log('sign result success:', signRes?.success);
      console.log('signature:', signRes?.data?.Signature ? signRes.data.Signature.slice(0, 32) + '...' : 'MISSING');
      console.log('\n==> KMS SUCCESS');
    }
  } catch (err) {
    console.error('\n==> KMS FAILED:', err.message);
    if (err.stack) console.error(err.stack.split('\n').slice(0, 5).join('\n'));
  }
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
