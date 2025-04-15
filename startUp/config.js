import config from 'config';

export default () => {
    if (!config.has('jwtPrivateKey')) throw new Error('FATAL error: jwtPrivateKey is not defined.');
}
