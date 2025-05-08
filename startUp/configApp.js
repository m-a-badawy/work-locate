import express from 'express';
import cors from 'cors';

export default function configApp(app) {
  app.use(cors({origin: "*"}));
  app.use(express.json());
};