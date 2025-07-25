import { Router } from 'express';
import { healthcheck } from "../controllers/healthcheck.controller.js"

const router = Router();

/**
 * @swagger
 * /healthcheck:
 *   get:
 *     summary: Health Check Route
 *     tags: 
 *      - Health Check   
 *     security: []
 *     responses:
 *       200:
 *         description: Servers Are running
 */
router.route('/').get(healthcheck);

export default router