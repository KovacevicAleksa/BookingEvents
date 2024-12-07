import { jest, describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../server.js';
import mongoose from 'mongoose';
import { setupTestServer, setupTestDatabase, cleanupTest } from './setup/testSetup.js';
import Ticket from '../models/ticket.js';

describe('Ticket Routes', () => {
  let server;
  let port;
  let authToken;
  let testUser;

  beforeAll(async () => {
    const { server: createdServer, port: assignedPort } = await setupTestServer(app);
    server = createdServer;
    port = assignedPort;

    const { testUser: user, authToken: token } = await setupTestDatabase();
    testUser = user;
    authToken = token;
  });

  afterAll(async () => {
    await cleanupTest(server, testUser);
  });

  it('should create a new ticket', async () => {
    const response = await request(app)
      .post('/tickets')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ eventID: 'event123', assignedTo: testUser._id });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('_id');
    expect(response.body).toHaveProperty('eventID', 'event123');
    expect(response.body).toHaveProperty('assignedTo', String(testUser._id));
  });

  it('should get all tickets', async () => {
    await Ticket.create({ eventID: 'event123', assignedTo: testUser._id });

    const response = await request(app)
      .get('/tickets')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('should filter tickets by eventID', async () => {
    await Ticket.create({ eventID: 'event456', assignedTo: testUser._id });

    const response = await request(app)
      .post('/tickets/filter')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ eventID: 'event456' });

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0]).toHaveProperty('eventID', 'event456');
  });

  it('should get a ticket by ID', async () => {
    const ticket = await Ticket.create({ eventID: 'event789', assignedTo: testUser._id });

    const response = await request(app)
      .get(`/tickets/${ticket._id}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('_id', String(ticket._id));
    expect(response.body).toHaveProperty('eventID', 'event789');
  });

  it('should update a ticket by ID', async () => {
    const ticket = await Ticket.create({ eventID: 'event123', assignedTo: testUser._id });

    const response = await request(app)
      .patch(`/tickets/${ticket._id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ eventID: 'updatedEvent' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('eventID', 'updatedEvent');
  });

  it('should delete a ticket by ID', async () => {
    const ticket = await Ticket.create({ eventID: 'eventToDelete', assignedTo: testUser._id });

    const response = await request(app)
      .delete(`/tickets/${ticket._id}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message', 'Ticket deleted successfully');
  });

  it('should return 404 for non-existing ticket', async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .get(`/tickets/${fakeId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe('Ticket not found');
  });

  it('should return 400 for invalid ticket ID', async () => {
    const response = await request(app)
      .get('/tickets/invalid-id')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Invalid Ticket ID');
  });
});
