import nodemailer from "nodemailer";


export const getGmailTransport = () => {
    const { GMAIL_APP_USER, GMAIL_APP_PASSWORD } = process.env;
    if (!GMAIL_APP_USER || !GMAIL_APP_PASSWORD) {
        throw new Error('Gmail app user and password are required');
    }

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: GMAIL_APP_USER,
            pass : GMAIL_APP_PASSWORD
        }
    })

    return {
        transporter,
        userId : GMAIL_APP_USER
    };
}