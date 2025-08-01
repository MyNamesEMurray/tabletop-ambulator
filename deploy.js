#!/usr/bin/env node
const { execSync } = require('child_process');
const inquirer = require('inquirer');
const fs = require('fs');

async function main() {
  console.log('=== Tabletop Ambulator Deployment ===');
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'database',
      message: 'Enter your Postgres DATABASE_URL:',
      validate: input => input ? true : 'DATABASE_URL is required'
    },
    {
      type: 'input',
      name: 'port',
      message: 'Enter server port:',
      default: '8000'
    }
  ]);

  const envContent = `DATABASE_URL=${answers.database}\nPORT=${answers.port}\n`;
  fs.writeFileSync('.env', envContent);
  console.log('Created .env file.');

  // Update process.env so subsequent commands inherit these values
  process.env.DATABASE_URL = answers.database;
  process.env.PORT = answers.port;

  console.log('Installing dependencies...');
  execSync('yarn install', { stdio: 'inherit' });

  console.log('Running database migrations...');
  execSync('npx sequelize-cli db:migrate', {
    stdio: 'inherit',
    env: { ...process.env }
  });

  console.log('Building client...');
  execSync('yarn build', { stdio: 'inherit', env: { ...process.env } });

  console.log('Starting server...');
  execSync('node server/server.js', {
    stdio: 'inherit',
    env: { ...process.env }
  });
}

main();

