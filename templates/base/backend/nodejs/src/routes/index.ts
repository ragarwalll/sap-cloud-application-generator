import express from 'express';
const router = express.Router();
import userRoute from './v1/user-route';

router.use('/user', userRoute);
export default router;
