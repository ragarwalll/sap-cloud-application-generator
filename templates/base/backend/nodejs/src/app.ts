import express from 'express';
import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import compression from 'compression';
import routes from './routes';
{{#if xsuaa}}
import passport from 'passport';
import { JWTStrategy } from '@sap/xssec';
import xsenv from '@sap/xsenv';
{{else}}
{{/if}}

const app = express();

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options('*', cors());

{{#if xsuaa}}
// jwt authentication xsuaa
passport.use(new JWTStrategy(xsenv.getServices({ uaa: { tag: 'xsuaa' } }).uaa));
app.use(passport.initialize());
{{else}}
{{/if}}


app.use('/v1', routes);

app.use((err: string, req: Request, res: Response, next: NextFunction) => {
    try {
        const customError = JSON.parse(err);
        res.status(customError.code ?? 400).json(customError);
    } catch (e) {
        next(err);
    }
});

app.use((req: Request, res: Response) => {
    res.status(404).send({ code: 404, message: 'Route not found' });
});

export { app };
