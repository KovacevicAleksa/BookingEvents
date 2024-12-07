import { jest, describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../server.js';
import { setupTestServer, setupTestDatabase, cleanupTest } from './setup/testSetup.js';

describe('Authentication Routes', () => {
  let server;
  let port;
  let authToken;
  let testUser;

  const testEmail = "testuser@example.com";
  const testPassword = "testpassword";

  // Pre testova, pokreni server i postavi bazu
  beforeAll(async () => {
    const { server: createdServer, port: assignedPort } = await setupTestServer(app);
    server = createdServer;
    port = assignedPort;

    const { testUser: user, authToken: token } = await setupTestDatabase();
    testUser = user;
    authToken = token;
  });

  // Nakon testova, očisti bazu i zaustavi server
  afterAll(async () => {
    await cleanupTest(server, testUser);
  });

  it('should register a new account successfully', async () => {
    const response = await request(app)
      .post('/register')
      .send({ email: 'newuser@example.com', password: 'NewPass123!' });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('email', 'newuser@example.com');
  });

  it('should fail registration with an existing email', async () => {
    const response = await request(app)
      .post('/register')
      .send({ email: testEmail, password: 'AnotherPass123!' });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toMatch(/Email already exists/);
  });

  it('should log in successfully and return a token', async () => {
    const response = await request(app)
      .post('/login')
      .send({ email: testEmail, password: testPassword });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.account).toHaveProperty('email', testEmail);
  });

  it('should fail login with incorrect password', async () => {
    const response = await request(app)
      .post('/login')
      .send({ email: testEmail, password: 'wrongpassword' });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toMatch(/Invalid email or password/);
  });

  it('should fail login with non-existent email', async () => {
    const response = await request(app)
      .post('/login')
      .send({ email: 'nonexistent@example.com', password: 'somepassword' });

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toMatch(/Invalid email or password/);
  });
});
