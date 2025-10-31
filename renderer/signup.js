const { ipcRenderer } = require('electron');

const signupForm = document.getElementById('signupForm');
const message = document.getElementById('message');
const loginLink = document.getElementById('loginLink');

signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const result = await ipcRenderer.invoke('create-user', { username, password });
  message.textContent = result.message;

  message.style.color = result.success ? 'green' : 'red';

  if (result.success) {
    // Optionally redirect to login page automatically
    setTimeout(() => {
      ipcRenderer.send('navigate', 'login.html');
    }, 1000);
  }
});

// Navigate back to Login page
loginLink.addEventListener('click', (e) => {
  e.preventDefault();
  ipcRenderer.send('navigate', 'login.html');
});
