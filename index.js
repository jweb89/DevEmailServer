require('dotenv').config();
const express = require('express');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const port = 3000;
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();

const store = { email: '', code: '' };

app.use(bodyParser.json());

app.post('/sendEmail', (req, res) => {
  const { email } = req.body;
  console.log('called', email);
  console.log(req);

  if (!email) {
    console.log('error');
    return res.status(404).send({ error: 'Please specify email' });
  }
  const phoneVerificationCode =
    Math.floor(10 * Math.random()).toString() +
    Math.floor(10 * Math.random()).toString() +
    Math.floor(10 * Math.random()).toString() +
    Math.floor(10 * Math.random()).toString() +
    Math.floor(10 * Math.random()).toString() +
    Math.floor(10 * Math.random()).toString();

  sgMail
    .send({
      to: email,
      from: 'support@styledslippers.com',
      subject: 'Zivolve Verification Code',
      text: 'Please use this code to verify your email on Zivolve',
      html: `<p>${phoneVerificationCode}</p>`,
    })
    .then(() => {
      // STORE CODE IN DB
      store.email = email;
      store.code = phoneVerificationCode;
      console.log('sent');
      return res.send({ message: 'email sent' });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).send({
        error: 'there was an issue sending your email please try again',
      });
    });
});

app.post('/verifyEmail', (req, res) => {
  const { email, code } = req.body;
  // Search DB to find email and check verification code
  if (code === store.code && email === store.email) {
    return res.status(200).send({ message: 'success' });
  }
  return res.status(404).send({ error: 'code is wrong motha fucka' });
});
// .then(() => {
//   if (code !== verificaitonCode) {
//     res.status(404).send({ error: 'Code is incorrect' });
//   }
//   res.status(200);
// })
// .catch(() => {
//   res.status(500).send({
//     error: 'There was an error processing your request please try again',
//   });
// });

app.listen(port, () => {
  console.log(`App listening on ${port}`);
});
