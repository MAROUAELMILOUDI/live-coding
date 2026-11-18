// Remplace par l'URL de ta ressource MockAPI
const API_URL = 'https://6afd6ffc2a9c141d36b88401.mockapi.io/api/v1/users';

const tbody = document.querySelector('#usersTable tbody');
const form = document.querySelector('#userForm');
const nameInput = document.querySelector('#name');
const emailInput = document.querySelector('#email');
const submitBtn = document.querySelector('#submitBtn');
const message = document.querySelector('#message');

let editId = null; // null = mode ajout, sinon id de l'utilisateur modifié

// GET : récupérer et afficher les utilisateurs
async function loadUsers() {
  message.textContent = 'Chargement...';
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`Erreur ${res.status}`);
    const users = await res.json();

    tbody.innerHTML = '';
    for (const user of users) {
      const tr = document.createElement('tr');
      tr.dataset.id = user.id;
      for (const value of [user.name, user.email]) {
        const td = document.createElement('td');
        td.textContent = value;
        tr.appendChild(td);
      }
      const actions = document.createElement('td');
      actions.innerHTML = '<button class="edit">Modifier</button> <button class="delete">Supprimer</button>';
      tr.appendChild(actions);
      tbody.appendChild(tr);
    }
    message.textContent = '';
  } catch (err) {
    message.textContent = 'Impossible de charger les utilisateurs : ' + err.message;
  }
}

// POST (ajout) ou PUT (modification) selon editId
async function saveUser(e) {
  e.preventDefault();
  const user = { name: nameInput.value.trim(), email: emailInput.value.trim() };

  if (!user.name || !user.email) {
    message.textContent = 'Tous les champs sont obligatoires.';
    return;
  }

  const url = editId ? `${API_URL}/${editId}` : API_URL;
  const method = editId ? 'PUT' : 'POST';
  const successText = editId ? 'Utilisateur modifié.' : 'Utilisateur ajouté.';

  try {
    const res = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    if (!res.ok) throw new Error(`Erreur ${res.status}`);
    form.reset();
    editId = null;
    submitBtn.textContent = 'Ajouter';
    await loadUsers();
    message.textContent = successText;
  } catch (err) {
    message.textContent = "Échec de l'enregistrement : " + err.message;
  }
}

// Un seul écouteur sur tbody pour tous les boutons (délégation)
tbody.addEventListener('click', async (e) => {
  const tr = e.target.closest('tr');
  if (!tr) return;
  const id = tr.dataset.id;

  // Modifier : pré-remplir le formulaire
  if (e.target.classList.contains('edit')) {
    nameInput.value = tr.children[0].textContent;
    emailInput.value = tr.children[1].textContent;
    editId = id;
    submitBtn.textContent = 'Enregistrer';
    nameInput.focus();
  }

  // DELETE : supprimer après confirmation
  if (e.target.classList.contains('delete')) {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Erreur ${res.status}`);

      // Si on supprime l'utilisateur en cours de modification, on quitte ce mode
      if (id === editId) {
        editId = null;
        form.reset();
        submitBtn.textContent = 'Ajouter';
      }

      await loadUsers();
      message.textContent = 'Utilisateur supprimé.';
    } catch (err) {
      message.textContent = 'Échec de la suppression : ' + err.message;
    }
  }
});

form.addEventListener('submit', saveUser);
loadUsers();