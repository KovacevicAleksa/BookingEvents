import { jest, describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../server.js';
import { setupTestServer, setupTestDatabase, cleanupTest } from './setup/testSetup.js';
import Account from '../models/account.js';
import dotenv from 'dotenv';

dotenv.config();


describe('Authentication Routes', () => {
  let server;
  let port;
  let authToken;
  let testUser;

  const testEmail = process.env.TEST_EMAIL;
  const testPassword = process.env.TEST_PASS;

  // Before all tests, start the server and set up the test database
  beforeAll(async () => {
    const { server: createdServer, port: assignedPort } = await setupTestServer(app);
    server = createdServer;
    port = assignedPort;

    const { testUser: user, authToken: token } = await setupTestDatabase();
    testUser = user;
    authToken = token;
  });

  // After all tests, clean up the test database and stop the server
  afterAll(async () => {
    // Delete the test user after tests are finished
    await Account.deleteMany({ email: `newuser@example.com`});
    await Account.deleteMany({ email: process.env.TEST_PASS});

    
    
    // Clean up the test database and stop the server
    await cleanupTest(server, testUser);
  });

  // Test for successful registration of a new account
  it('should register a new account successfully', async () => {
    const response = await request(app)
      .post('/register')
      .send({ email: 'newuser@example.com', password: 'NewPass123!' });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('email', 'newuser@example.com');
  });

  // Test for failed registration with an existing email
  it('should fail registration with an existing email', async () => {
    const response = await request(app)
      .post('/register')
      .send({ email: testEmail, password: 'AnotherPass123!' });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toMatch(/Email already exists/);
  });

  // Test for successful login and token return
  it('should log in successfully and return a token', async () => {
    const response = await request(app)
      .post('/login')
      .send({ email: testEmail, password: testPassword });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.account).toHaveProperty('email', testEmail);
  });

  // Test for failed login due to incorrect password
  it('should fail login with incorrect password', async () => {
    const response = await request(app)
      .post('/login')
      .send({ email: testEmail, password: 'wrongpassword' });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toMatch(/Invalid email or password/);
  });

  // Test for failed login due to non-existent email
  it('should fail login with non-existent email', async () => {
    const response = await request(app)
      .post('/login')
      .send({ email: 'nonexistent@example.com', password: 'somepassword' });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toMatch(/Invalid email or password/);
  });
});
