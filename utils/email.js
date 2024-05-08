const nodemailer = require('nodemailer');
const { options } = require('../routes/usersRoute');
const sendEmail = async (options) => {
  //  1 Create Transpoter
  console.log(process.env.EMAIL_HOST);

  const Transpoter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
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
  };

  // 3 Actullay send the email

  await transporter.sendMail(mailOptions);
};
module.exports = sendEmail;
