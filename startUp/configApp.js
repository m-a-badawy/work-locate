import express from 'express';
import cors from 'cors';

export default function configApp(app) {
  app.use(cor());
  app.use(express.json());
};