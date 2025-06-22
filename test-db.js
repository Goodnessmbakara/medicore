import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

console.log('Testing database connection...');
console.log('DATABASE_URL:', process.env.DATABASE_URL);

// Test 1: Using connectionString with different SSL config
console.log('\n=== Test 1: Using connectionString with ssl: true ===');
try {
  const pool1 = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true
  });
  
  const client1 = await pool1.connect();
  console.log('✅ Connection successful with connectionString and ssl: true!');
  await client1.release();
  await pool1.end();
} catch (error) {
  console.log('❌ Connection failed with connectionString and ssl: true:', error.message);
}

// Test 2: Using connectionString with ssl: { rejectUnauthorized: false }
console.log('\n=== Test 2: Using connectionString with ssl: { rejectUnauthorized: false } ===');
try {
  const pool2 = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  const client2 = await pool2.connect();
  console.log('✅ Connection successful with connectionString and ssl: { rejectUnauthorized: false }!');
  await client2.release();
  await pool2.end();
} catch (error) {
  console.log('❌ Connection failed with connectionString and ssl: { rejectUnauthorized: false }:', error.message);
}

// Test 3: Using connectionString without SSL config
console.log('\n=== Test 3: Using connectionString without SSL config ===');
try {
  const pool3 = new Pool({
    connectionString: process.env.DATABASE_URL
  });
  
  const client3 = await pool3.connect();
  console.log('✅ Connection successful with connectionString without SSL config!');
  await client3.release();
  await pool3.end();
} catch (error) {
  console.log('❌ Connection failed with connectionString without SSL config:', error.message);
}

// Test 4: Using individual parameters with ssl: true
console.log('\n=== Test 4: Using individual parameters with ssl: true ===');
try {
  const pool4 = new Pool({
    host: 'ep-still-snowflake-a4hy02a6-pooler.us-east-1.aws.neon.tech',
    port: 5432,
    database: 'neondb',
    user: 'neondb_owner',
    password: 'npg_jzB07dxYqOnv',
    ssl: true
  });
  
  const client4 = await pool4.connect();
  console.log('✅ Connection successful with individual parameters and ssl: true!');
  await client4.release();
  await pool4.end();
} catch (error) {
  console.log('❌ Connection failed with individual parameters and ssl: true:', error.message);
}

console.log('\nTest completed.'); 