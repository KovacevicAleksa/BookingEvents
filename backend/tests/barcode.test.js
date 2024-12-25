import { jest, describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../server.js';
import { setupTestServer, setupTestDatabase, cleanupTest } from './setup/testSetup.js';
import QRCode from 'qrcode';

describe('QRCode Routes', () => {
  let server;
  let port;
  let authToken;
  let testUser;

  const testEmail = "testuser@example.com";
  const testPassword = "testpassword";

  // Pre test setup: Start the server and prepare the database
  beforeAll(async () => {
    const { server: createdServer, port: assignedPort } = await setupTestServer(app);
    server = createdServer;
    port = assignedPort;

    const { testUser: user, authToken: token } = await setupTestDatabase();
    testUser = user;
    authToken = token;
  });

  // After test cleanup: Remove test data and stop the server
  afterAll(async () => {
    await cleanupTest(server, testUser);
  });

  it('should generate a QR code with valid text', async () => {
    const response = await request(app)
      .post('/generate-qrcode')
      .send({ text: 'Hello World' })  // Valid text to encode
      .set('Authorization', `Bearer ${authToken}`);  // Use the auth token for testing

    expect(response.statusCode).toBe(200);
    expect(response.body.qrCode).toMatch(/^data:image\/png;base64,/);  // Check if the QR code is in Base64 format
  });

  it('should return 400 if no text is provided', async () => {
    const response = await request(app)
      .post('/generate-qrcode')
      .send({})  // No text
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Valid text to encode is required');
  });

  it('should return 500 if there is an error generating the QR code', async () => {
    // Mock the QRCode.toDataURL to simulate an error
    QRCode.toDataURL = jest.fn().mockRejectedValue(new Error('Failed to generate QR Code'));

    const response = await request(app)
      .post('/generate-qrcode')
      .send({ text: 'Hello World' })
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.statusCode).toBe(500);
    expect(response.body.error).toBe('Failed to generate QR Code');
  });
});
