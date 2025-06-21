import { getGmailTransport } from "../connections/mail";
import { SendMailPropsI } from "../types/mail";


export const sendEmailAlert = async (props : SendMailPropsI) => {
    if (!props.body && !props.html) {
        throw new Error("Either body or html must be provided for the email.");
    }

    const {transporter : mailTransporter, userId : senderEmail} = getGmailTransport();
    const mailOptions = {
        from: `"Biblio Recommend Alert" <${senderEmail}>`,
        to: props.to,
        subject: props.subject,
        text: props.body,
        html: props.html
    };

    try {
        const info = await mailTransporter.sendMail(mailOptions);
        console.log("Email sent successfully:", info.response);
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error(`Failed to send email: ${error}`);
    }
}