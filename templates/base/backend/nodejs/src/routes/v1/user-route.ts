import express, { Request, Response } from 'express';
{{#if xsuaa}}
import { auth } from 'src/middlewares/xsuaa-auth';
const router = express.Router();

router.get('/', auth(), async (req: Request, res: Response) => {
    res.send('Hello World!');
});
{{else}}
const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
    res.send('Hello World!');
});
{{/if}}

export default router;
