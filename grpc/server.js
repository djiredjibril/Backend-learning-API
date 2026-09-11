const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDef = protoLoader.loadSync('user.proto', {});
const grpcObject = grpc.loadPackageDefinition(packageDef);
const userPackage = grpcObject.user;

// --- Données factices ---
const users = [
  { id: '1', name: 'Awa', email: 'awa@example.com' },
  { id: '2', name: 'Koffi', email: 'koffi@example.com' },
  { id: '3', name: 'Fatou', email: 'fatou@example.com' },
];

// --- Implémentation des méthodes définies dans le .proto ---
function GetUser(call, callback) {
  console.log("call ", call, "call.request ", call.request);
  
  const user = users.find((u) => u.id === call.request.id);
  if (!user) {
    return callback({ code: grpc.status.NOT_FOUND, message: 'Utilisateur introuvable' });
  }
  callback(null, user); // équivalent d'un "return" classique
}

function ListUsers(call) {
  // Streaming : on envoie chaque utilisateur un par un, avec un léger délai,
  // pour bien montrer que ce n'est PAS une seule réponse groupée.
  let i = 0;
  const interval = setInterval(() => {
    if (i >= users.length) {
      clearInterval(interval);
      call.end(); // fin du flux
      return;
    }
    call.write(users[i]); // envoi d'un message dans le flux
    i++;
  }, 300);
}

const server = new grpc.Server();
server.addService(userPackage.UserService.service, { GetUser, ListUsers });

server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
  console.log('Serveur gRPC prêt sur 0.0.0.0:50051');
});
