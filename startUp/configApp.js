import cors from 'cors';
import express from 'express';

export default function configApp(app) {
  app.use(cors());
  app.use(express.json());
}
