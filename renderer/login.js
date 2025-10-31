const { ipcRenderer } = require('electron');

const loginForm = document.getElementById('loginForm');
const message = document.getElementById('message');
const signupLink = document.getElementById('signupLink');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const result = await ipcRenderer.invoke('login', { username, password });

  if (result.success) {
    message.style.color = 'green';
    message.innerText = result.message;

    // Redirect to dashboard after short delay
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 500);
  } else {
    message.style.color = 'red';
    message.innerText = result.message;
  }
});

// Navigate to signup page
signupLink.addEventListener('click', () => {
  window.location.href = 'signup.html';
});
