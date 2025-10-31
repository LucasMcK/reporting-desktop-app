require('dotenv').config();
const { spawn } = require('child_process');

if (!process.env.GITHUB_TOKEN) {
  console.error('Error: GITHUB_TOKEN is not set. Check your .env file.');
  process.exit(1);
}

console.log('Loaded environment variables from .env');
console.log('Starting Electron Forge publish...\n');

const publish = spawn('electron-forge', ['publish'], { stdio: 'inherit', shell: true });

publish.on('close', (code) => {
  if (code === 0) {
    console.log('\nPublish complete!');
  } else {
    console.error(`\nPublish failed with exit code ${code}`);
    process.exit(code);
  }
});
