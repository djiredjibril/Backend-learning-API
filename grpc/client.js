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
client.GetUser({ id: '2' }, (err, response) => {
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

    // --- 3. UpdateUserName : mise à jour, on récupère l'objet à jour ---
    console.log('\n--- UpdateUserName ---');
    client.UpdateUserName({ id: '2', name: 'Koffi Mensah' }, (err, response) => {
      if (err) {
        console.error('Erreur UpdateUserName:', err.message);
      } else {
        console.log('Utilisateur mis à jour :', response);
      }

      // --- 4. CreatePost : "poster" depuis un user ---
      console.log('\n--- CreatePost (cas normal) ---');
      client.CreatePost({ authorId: '2', title: 'Mon premier post via gRPC' }, (err, post) => {
        if (err) {
          console.error('Erreur CreatePost:', err.message);
        } else {
          console.log('Post créé :', post);
        }

        // --- 5. CreatePost avec un authorId inexistant, pour voir l'erreur gérée ---
        console.log('\n--- CreatePost (auteur inexistant) ---');
        client.CreatePost({ authorId: '999', title: 'Post orphelin' }, (err, post) => {
          if (err) {
            console.error('Erreur attendue ->', err.message);
          } else {
            console.log('Post créé :', post);
          }
        });
      });
    });
  });
});
