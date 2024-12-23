import express from 'express';
import stripeModule from 'stripe';
import validateRequest from '../middleware/validateRequest.js';
import { createPaymentSchema } from '../models/paymentSchemas.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const stripe = stripeModule(process.env.STRIPE_SECRET_KEY);
/**
 * POST /create-payment-intent
 * Route to create a Stripe Payment Intent.
 */
router.post(
  '/create-payment-intent',
  validateRequest(createPaymentSchema), // Middleware for request validation
  async (req, res) => {
    const { ticketPrice } = req.body;

    try {
      // Create Payment Intent with the provided ticket price (converted to cents)
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(ticketPrice * 100), // Convert dollars to cents
        currency: 'usd',
      });

      // Respond with the client secret
      res.status(200).json({
        status: 'success',
        message: 'Payment Intent created successfully',
        data: {
          clientSecret: paymentIntent.client_secret,
        },
      });
    } catch (error) {
      // Log the error and respond with a generic message
      console.error('Error creating Payment Intent:', error);
      res.status(500).json({
        status: 'error',
        message: 'An error occurred while creating the payment intent',
      });
    }
  }
);

export default router;
 