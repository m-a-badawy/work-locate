import express from 'express';

export default function configApp(app) {
  app.use(express.json());
};