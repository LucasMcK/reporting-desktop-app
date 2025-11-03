const { ipcRenderer } = require('electron');

const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('toggleBtn');
const logoutBtn = document.getElementById('logoutBtn');

// Toggle sidebar collapse
toggleBtn.addEventListener('click', () => {
  sidebar.classList.toggle('collapsed');
});

// Highlight active link
document.querySelectorAll('.sidebar nav a').forEach(link => {
  link.addEventListener('click', () => {
    document.querySelectorAll('.sidebar nav a').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
  });
});

// Logout
logoutBtn.addEventListener('click', () => {
  ipcRenderer.send('navigate', 'login.html');
});
