import mongoose from 'mongoose';
import { createServer } from 'http';
import { promisify } from 'util';
import Account from '../../models/account.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export async function setupTestServer(app) {
  // Create HTTP server without starting it
  const server = createServer(app);
  
  // Promisify server listen and close
  const listen = promisify(server.listen.bind(server));
  server.closeAsync = promisify(server.close.bind(server));
  
  // Find a random available port
  await listen(0);
  const port = server.address().port;
  
  return {
    server,
    port
  };
}

export async function setupTestDatabase() {
  try {
    // Close any existing connections
    await mongoose.connection.close();
    
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    
    // Create test user
    const testUser = new Account({
      email: process.env.TEST_EMAIL,
      password: process.env.TEST_PASS,
      isAdmin: true,
      isOrganizer: true,
    });
    const savedUser = await testUser.save();
    
    // Generate auth token
    const authToken = jwt.sign(
      { id: savedUser._id, email: testUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    
    return {
      testUser: savedUser,
      authToken
    };
  } catch (error) {
    console.error('Database setup failed:', error);
    throw error;
  }
}

export async function cleanupTest(server, testUser) {
  try {
    // Delete test user if exists
    if (testUser) {
      await Account.deleteOne({ _id: testUser._id });
    }
    
    // Close database connection
    await mongoose.connection.close();
    
    // Close server if exists
    if (server) {
      await server.closeAsync();
    }
    
    // Add a small delay to ensure cleanup is complete
    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (error) {
    console.error('Cleanup failed:', error);
    throw error;
  }
}