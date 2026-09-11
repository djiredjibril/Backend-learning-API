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

const posts = [
  { id: '101', title: 'Découvrir gRPC', authorId: '1' },
];
let nextPostId = 102;

// --- Implémentation des méthodes définies dans le .proto ---
function GetUser(call, callback) {
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

function UpdateUserName(call, callback) {
  const user = users.find((u) => u.id === call.request.id);
  if (!user) {
    return callback({ code: grpc.status.NOT_FOUND, message: 'Utilisateur introuvable' });
  }
  // Petite validation : un champ vide n'a pas de sens ici.
  if (!call.request.name || call.request.name.trim() === '') {
    return callback({
      code: grpc.status.INVALID_ARGUMENT,
      message: 'Le nom ne peut pas être vide',
    });
  }
  user.name = call.request.name;
  callback(null, user); // on renvoie l'utilisateur à jour
}

function CreatePost(call, callback) {
  const { authorId, title } = call.request;

  // On vérifie que l'auteur existe réellement avant de créer le post
  // -- exactement le même genre de contrôle qu'on ferait avec une
  // contrainte de clé étrangère en base de données.
  const author = users.find((u) => u.id === authorId);
  if (!author) {
    return callback({
      code: grpc.status.NOT_FOUND,
      message: `Aucun utilisateur avec l'id "${authorId}"`,
    });
  }

  const newPost = { id: String(nextPostId++), title, authorId };
  posts.push(newPost);
  callback(null, newPost);
}

const server = new grpc.Server();
server.addService(userPackage.UserService.service, {
  GetUser,
  ListUsers,
  UpdateUserName,
  CreatePost,
});

server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
  console.log('Serveur gRPC prêt sur 0.0.0.0:50051');
});
