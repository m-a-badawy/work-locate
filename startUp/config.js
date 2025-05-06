import config from 'config';

export default () => {
    if (!config.has('email.password')) throw new Error('FATAL error: email.password is not defined.');
    if (!config.has('email.service')) throw new Error('FATAL error: email.service is not defined.');
    if (!config.has('jwtPrivateKey')) throw new Error('FATAL error: jwtPrivateKey is not defined.');
    if (!config.has('email.user')) throw new Error('FATAL error: email.user is not defined.');
    if (!config.has('db')) throw new Error('FATAL error: db is not defined.');
}