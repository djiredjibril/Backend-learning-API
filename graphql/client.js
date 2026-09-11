// Exemple de client : on demande EXACTEMENT les champs voulus, rien de plus.
const query = `
  query {
    users {
      name
      posts {
        title
      }
    }
  }
`;

const response = await fetch('http://localhost:4000/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query }),
});

const { data } = await response.json();
console.log('Réponse GraphQL (uniquement name + posts.title) :');
console.log(JSON.stringify(data, null, 2));

// --- Exemple de mutation ---
const mutation = `
  mutation {
    addUser(name: "Fatou", email: "fatou@example.com") {
      id
      name
    }
  }
`;

const mutationResponse = await fetch('http://localhost:4000/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: mutation }),
});

const mutationResult = await mutationResponse.json();
console.log('\nRésultat de la mutation addUser :');
console.log(JSON.stringify(mutationResult.data, null, 2));
