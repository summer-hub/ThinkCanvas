#!/usr/bin/env node

/**
 * Setup script to configure DeepSeek API key in localStorage
 * This will be injected when the app starts
 */

const fs = require('fs');
const path = require('path');

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-b929a2e72349465c851c6c56dc69ce5a';

console.log('🔧 Setting up DeepSeek API configuration...');
console.log(`📝 API Key: ${DEEPSEEK_API_KEY.substring(0, 10)}...`);

// Create a config file that will be loaded by the app
const configPath = path.join(__dirname, '../public/config.json');
const publicDir = path.join(__dirname, '../public');

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const config = {
  defaultProvider: 'deepseek',
  apiKey: DEEPSEEK_API_KEY,
  timestamp: new Date().toISOString()
};

fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

console.log('✅ DeepSeek API configured successfully!');
console.log('🚀 You can now start the app with: npm run dev');
