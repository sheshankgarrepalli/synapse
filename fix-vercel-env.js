#!/usr/bin/env node

const https = require('https');

const TOKEN = 'vca_2tqLsoOSM5IzGF7AV0bGvQZ8DYywh2yKvitNeyPNz5AMZoND9N31Thgw';
const PROJECT_ID = 'prj_0PdZBudpEEnEG1ra4TUW6TrtJFVF';
const TEAM_ID = 'team_8FNj9PlGfcVECW8IavDycCVA';

// Environment variables to fix
const ENV_VARS = {
  'GITHUB_CLIENT_ID': 'Ov23lioId7oM4IlMVOSW',
  'GITHUB_CLIENT_SECRET': '901d7cfbd6a4282bb398db4591d5ea896ed16331',
  'GITHUB_WEBHOOK_SECRET': '020b82d2c4c440ceaf309f56a87cd4075dd5d0dee396ad57bb343aec3c75dd6d',
  'NEXT_PUBLIC_APP_URL': 'https://synpase-8y6173fri-sheshanks-projects-5275d9db.vercel.app',
  'LINEAR_CLIENT_ID': '8a857ff13b59e4aa34ee6afab8390a7e',
  'LINEAR_CLIENT_SECRET': 'b4ea9f919be66832a5979f7d972a5ff9',
  'CLERK_SECRET_KEY': 'sk_test_Y5wedSeCrXZV68YyC2zk3pSIp6O0Bs3WheLYhfmJTZ',
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY': 'pk_test_ZG9taW5hbnQtbGlnZXItNDkuY2xlcmsuYWNjb3VudHMuZGV2JA',
  'NEXT_PUBLIC_SUPABASE_URL': 'https://plqcljzepkliodbmceid.supabase.co',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBscWNsanplcGtsaW9kYm1jZWlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NTgyOTMsImV4cCI6MjA3NjAzNDI5M30.wrzpk9IjYPAjQGwDbKC-OfF49awX3aafqOUrkLHvIuM',
  'NODE_ENV': 'production',
  'ENCRYPTION_MASTER_KEY': 'zU6IZtzF2dYpbPlpd/1Rhh6qGLK08rQC5B9VCtDZAqc=',
  'ENCRYPTION_KEY': '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
  'DATABASE_URL': 'postgresql://postgres.plqcljzepkliodbmceid:Sharkie@99@aws-1-us-east-2.pooler.supabase.com:6543/postgres',
  'DATABASE_DIRECT_URL': 'postgresql://postgres:Sharkie@99@db.plqcljzepkliodbmceid.supabase.co:5432/postgres'
};

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            resolve(body);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function getEnvVars() {
  const options = {
    hostname: 'api.vercel.com',
    path: `/v9/projects/${PROJECT_ID}/env?teamId=${TEAM_ID}`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    }
  };

  return makeRequest(options);
}

async function deleteEnvVar(envId) {
  const options = {
    hostname: 'api.vercel.com',
    path: `/v9/projects/${PROJECT_ID}/env/${envId}?teamId=${TEAM_ID}`,
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    }
  };

  return makeRequest(options);
}

async function createEnvVar(key, value) {
  const options = {
    hostname: 'api.vercel.com',
    path: `/v10/projects/${PROJECT_ID}/env?teamId=${TEAM_ID}&upsert=true`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    }
  };

  const data = {
    key: key,
    value: value,
    type: 'encrypted',
    target: ['production']
  };

  return makeRequest(options, data);
}

async function main() {
  console.log('🔧 Fixing Vercel environment variables...\n');

  try {
    // Get all existing env vars
    console.log('📋 Fetching existing environment variables...');
    const response = await getEnvVars();
    const existingVars = response.envs || [];

    // Delete corrupted variables
    console.log('🗑️  Deleting corrupted environment variables...');
    for (const envVar of existingVars) {
      if (ENV_VARS.hasOwnProperty(envVar.key)) {
        console.log(`   Deleting: ${envVar.key}`);
        try {
          await deleteEnvVar(envVar.id);
          console.log(`   ✓ Deleted: ${envVar.key}`);
        } catch (err) {
          console.log(`   ⚠ Could not delete ${envVar.key}: ${err.message}`);
        }
        // Wait a bit between deletions
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log('\n✨ Creating clean environment variables...');
    // Create new clean variables
    for (const [key, value] of Object.entries(ENV_VARS)) {
      console.log(`   Adding: ${key}`);
      try {
        await createEnvVar(key, value);
        console.log(`   ✓ Added: ${key}`);
      } catch (err) {
        console.log(`   ✗ Failed to add ${key}: ${err.message}`);
      }
      // Wait a bit between creations
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n✅ Environment variables fixed successfully!');
    console.log('\n📦 Next steps:');
    console.log('   1. Run: npx vercel --prod');
    console.log('   2. Test GitHub OAuth connection');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
