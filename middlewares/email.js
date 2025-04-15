import nodemailer from 'nodemailer';
import config from 'config';

export default async (req, res, next) => {
    if (!req.emailOptions) return res.status(500).send('Email options not provided.');

    try {
        const transporter = nodemailer.createTransport({
            service: config.get('email.service'),
            auth: {
                user: config.get('email.user'),
                pass: config.get('email.password'),
            },
        });
        await transporter.sendMail(req.emailOptions);

    } catch (err) {
        console.error('Error sending email:', err);
        res.status(500).send(err.message || 'Something went wrong. Please try again later.');
    }
};

