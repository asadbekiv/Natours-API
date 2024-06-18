const nodemailer = require('nodemailer');
const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    //  2 Define email options
    const mailOptions = {
      from: 'Bob Smith <bob@gmail.com>',
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.message,
    };

    // 3 Actullay send the email

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
  //  1 Create Transpoter
};
module.exports = sendEmail;
