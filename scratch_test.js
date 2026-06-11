const { OrbitportSDK, createStorage } = require("@spacecomputer-io/orbitport-sdk-ts");

const storage = createStorage({
  type: "file",
  filePath: ".orbitport_token",
});

const sdk = new OrbitportSDK({
  config: {
    apiUrl: "https://op.spacecomputer.io",
    authDomain: "auth.spacecomputer.io",
    clientId: "l5FAFTzUldqXAcClH57GZ7iK6DzyJEuR",
    clientSecret: "3hynjmRJyFJv4TiDcuzgMNatrTt6AQTOZLGhc-bfNuoT4sL0tsQFU2qZ5qRnmVJ8"
  },
  storage
});

sdk.setDebug(true);

sdk.ctrng.random({ src: 'trng' })
  .then(res => {
    console.log("SUCCESS:", res.success);
    console.log("DATA:", JSON.stringify(res.data, null, 2));
  })
  .catch(err => {
    console.error("ERROR:", err);
  });
