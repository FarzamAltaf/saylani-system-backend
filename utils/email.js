import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'farzamaltaf888@gmail.com',
        pass: 'ewspeitvwoqblict',
    },
});

export const sendEmail = async (to, subject, text, isHtml = false) => {
    try {
        await transporter.sendMail({
            from: 'farzamaltaf888@gmail.com',
            to,
            subject,
            [isHtml ? 'html' : 'text']: text,
        });
        console.log('Email sent successfully!');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};
