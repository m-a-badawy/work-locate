import express from 'express';
import cor from 'cors';

export default function configApp(app) {
  app.use(cor());
  app.use(express.json());
};