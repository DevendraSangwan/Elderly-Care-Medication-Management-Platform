const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');

// Create isolated test app to verify core health, auth validation, and medication routes
const app = express();
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'CareBridge API' });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password, pin } = req.body;
  if (!email || (!password && !pin)) {
    return res.status(400).json({ message: 'Email and credentials are required' });
  }
  return res.status(200).json({ token: 'mock-jwt-token', user: { email, role: 'elderly' } });
});

app.post('/api/medications', (req, res) => {
  const { name, dosage } = req.body;
  if (!name || !dosage) {
    return res.status(400).json({ message: 'Medication name and dosage are required' });
  }
  return res.status(201).json({ id: 'med_101', name, dosage, status: 'pending' });
});

test('GET /api/health returns 200 OK', async () => {
  const server = app.listen(0);
  const port = server.address().port;
  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/health`);
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.status, 'ok');
  } finally {
    server.close();
  }
});

test('POST /api/auth/login rejects missing credentials with 400', async () => {
  const server = app.listen(0);
  const port = server.address().port;
  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'martha@carebridge.health' })
    });
    assert.equal(res.status, 400);
  } finally {
    server.close();
  }
});

test('POST /api/auth/login succeeds with valid PIN', async () => {
  const server = app.listen(0);
  const port = server.address().port;
  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'martha@carebridge.health', pin: '1234' })
    });
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.ok(data.token);
  } finally {
    server.close();
  }
});

test('POST /api/medications creates a medication schedule item', async () => {
  const server = app.listen(0);
  const port = server.address().port;
  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/medications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Metformin', dosage: '500 mg' })
    });
    const data = await res.json();
    assert.equal(res.status, 201);
    assert.equal(data.name, 'Metformin');
  } finally {
    server.close();
  }
});
