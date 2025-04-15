import compression from 'compression';
import helmet from 'helmet';

export default (app) => {
    app.use(helmet());
    app.use(compression());
};
