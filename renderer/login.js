const { ipcRenderer } = require('electron');

const loginForm = document.getElementById('loginForm');
const message = document.getElementById('message');
const signupLink = document.getElementById('signupLink');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const result = await ipcRenderer.invoke('login', { username, password });

  message.innerText = result.message;
  message.style.color = result.success ? 'green' : 'red';

  if (result.success) {
    // Redirect to dashboard via main process
    setTimeout(() => {
      ipcRenderer.send('navigate', 'dashboard.html');
    }, 500);
  }
});

signupLink.addEventListener('click', (e) => {
  e.preventDefault();
  ipcRenderer.send('navigate', 'signup.html');
});
