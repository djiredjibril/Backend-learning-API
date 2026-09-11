const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDef = protoLoader.loadSync('user.proto', {});
const grpcObject = grpc.loadPackageDefinition(packageDef);
const userPackage = grpcObject.user;

const client = new userPackage.UserService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

// --- 1. Appel unaire classique (comme un GET REST) ---
client.GetUser({ id: '4' }, (err, response) => {
  if (err) {
    console.error('Erreur GetUser:', err.message);
  } else {
    console.log('--- GetUser (appel unaire) ---');
    console.log(response);
  }

  // --- 2. Appel en streaming : le serveur pousse plusieurs messages ---
  console.log('\n--- ListUsers (streaming serveur) ---');
  const call = client.ListUsers({});

  call.on('data', (user) => {
    console.log('Reçu en flux :', user);
  });

  call.on('end', () => {
    console.log('Flux terminé.');
  });
});
