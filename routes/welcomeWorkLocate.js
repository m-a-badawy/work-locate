import express from 'express';

import {
    welcomeWorkLocate,
} from '../controllers/welcomeWorkLocate.js';

const router = express.Router();

router.get(
    '/',
    welcomeWorkLocate
);

export default router;