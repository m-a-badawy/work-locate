// configApp.js
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';
import express from 'express';
import config from 'config';
import cors from 'cors';

export default function configApp(app) {
  app.use(cors());
  app.use(express.json());

  // Clerk middleware setup (protects all following routes)
  app.use(
    ClerkExpressWithAuth({
      apiKey: config.get('clerk.secretKey'),
    })
  );
}