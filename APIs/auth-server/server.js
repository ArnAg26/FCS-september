const cors = require('cors')
const express = require('express');


const fs = require('fs');
const https = require('https');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const axios = require('axios');
const app = express();
app.use(cors());
app.use(express.json());
const crypto=require('crypto');
const { authenticate } = require('/home/iiitd/project/APIs/auth-server/auth.js');


const secretKey = 'z9mnq913ffjkslat29fslj28ufskzaal9z1';




// const apiLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // Limit each IP to 100 requests per window (here, per 15 minutes)
//   message: 'Too many requests from this IP, please try again after 15 minutes',
//   standardHeaders: true, // Return rate limit info in the RateLimit-* headers
//   legacyHeaders: false, // Disable the X-RateLimit-* headers
//   keyGenerator: (req, res) => {
//     return req.clientIp // IP address from requestIp.mw(), as opposed to req.ip
//   }
// });

// app.use(apiLimiter);


const server = https.createServer(
  {
    key: fs.readFileSync("/etc/nginx/ssl/myhostname.key"),
    cert: fs.readFileSync("/etc/nginx/ssl/myhostname.crt"),
  },
  app
);

server.listen(8080, () => {
  const address = server.address();
  console.log(`Server is running on https://localhost:${address.port}`);
});


app.get('/', (req, res) => {
  res.send("Hello from express serverss")
})


// app.post('/login', (req, res) => {
//   const { username, password } = req.body;

//   // Creating a hash of username and password
//   const hash = crypto.createHash('sha256');
//   hash.update(username + password); // Combining username and password
//   const userPassHash = hash.digest('hex');

//   // Generate a secure random token
//   const randomPart = crypto.randomBytes(48).toString('hex');

//   // Combine the hashed username+password and the random part
//   const token = userPassHash + randomPart;

//   console.log('Generated Token:', token);

//   res.send({
//     token: token
//   });
// });

async function verifyRecaptcha(recaptchaToken){
  try{
    const secret="6Ld7whEpAAAAAAq8scWvCafIxQotYi9Z_j5RJYKP";
    const recaptchaResponse = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${recaptchaToken}`);
    console.log(recaptchaResponse);
    return recaptchaResponse;
  }
  catch(error){
    console.log(error);
  }
}
app.post('/verifyRecaptcha', async (req, res) => {
  const { recaptchaToken } = req.body;
  
  try {
    const recaptchaResponse = await verifyRecaptcha(recaptchaToken);

    if (recaptchaResponse.data.success) {
      res.status(200).send("Recapthca was a success"); 
    } else {
      res.status(400).send({ success: false, message: 'Recaptcha Failed!' }); // Send unauthorized response
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: 'Internal server error' }); // Send server error response
  }
});
// app.post('/verifyRecaptcha', (req, res) => {

  


// });
app.post('/login', (req, res) => {
  console.log(req.body);
  const { username, password } = req.body;
  const date = new Date();
  const refDate = new Date("2020-01-01");
  const secpassed = Math.floor((date - refDate) / 1000);
 const showTime=date.getMinutes()*60 + date.getSeconds()+date.getHours()*60*60+secpassed;

const numString = String(showTime);
    const baseCharCode = 'a'.charCodeAt(0) - 1;
    let time = '';
    for (let i = 0; i < numString.length; i++) {
      const digit = parseInt(numString[i], 10)+5;
      const letterCode = baseCharCode + digit;
      time +=  String.fromCharCode(letterCode);
    }
    console.log("Time");
    console.log(time);
    message=time;
  const cipher = crypto.createCipher('aes-256-cbc', 'z9mnq913ffjkslat29fslj28ufskzaal9z1');
  let encryptedMessage = cipher.update(message, 'utf-8', 'hex');
  encryptedMessage += cipher.final('hex');
    const credentials = { username,encryptedMessage};
  res.send({
    token: credentials
  });
});

app.post('/kyc', async (req, res) => {
  const { username, password } = req.body;
  console.log(req.body);
  try {
    const response =  await axios.post('https://192.168.3.39:5000/kyc', {
      email: username,
      password: password
    });
    console.log(response.data);
    res.send(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

const config = {
  RAZOR_PAY_KEY_ID: 'rzp_test_vf7Ws52tICBBSE',
  RAZOR_PAY_KEY_SECRET: 'BzLnj58kRyDHpZC2SnB7gNJQ',
};

const Razorpay = require("razorpay");
const instance = new Razorpay({
  key_id: config.RAZOR_PAY_KEY_ID,
  key_secret: config.RAZOR_PAY_KEY_SECRET,
});

app.get("/order", (req, res) => {
  try {
    const options = {
      amount: 10 * 100, // amount == Rs 10
      currency: "INR",
      receipt: "receipt#1",
      payment_capture: 0,
 // 1 for automatic capture // 0 for manual capture
    };
  instance.orders.create(options, async function (err, order) {
    if (err) {
      return res.status(500).json({
        message: "Something Went Wrong",
      });
    }
  return res.status(200).json(order);
 });
} catch (err) {
  return res.status(500).json({
    message: "Something Went Wrong",
  });
 }
});

app.post("/capture/:paymentId", (req, res) => {
  try {
    paymentId = req.params.paymentId;
    amount = 10 * 100;
    currency = "INR";
    instance.payments.capture(paymentId, amount, currency, async function (
      err,
      payment
    ) {
      if (err) {
        return res.status(500).json({
          message: "Something Went Wrong",
        });
      }
      console.log("Payment:", payment);
      return res.status(200).json(payment);
    });
  } catch (err) {
    return res.status(500).json({
      message: "Something Went Wrong",
    });
  }
});



app.post('/decrypt', (req, res) => {
  const { encryptedMessage } = req.body;
  // For demonstration purposes, let's assume decryption logic here.
  // Here, just echoing the received message.
  const decipher = crypto.createDecipher('aes-256-cbc', 'z9mnq913ffjkslat29fslj28ufskzaal9z1');
  let decryptedMessage = decipher.update(encryptedMessage, 'hex', 'utf-8');
  decryptedMessage += decipher.final('utf-8');
  const baseCharCode = 'a'.charCodeAt(0) - 1;
    let originalNumber = '';
    for (let i = 0; i < decryptedMessage.length; i++) {
      const letter = decryptedMessage[i];
      const letterCode = letter.charCodeAt(0);
      originalNumber += letterCode - baseCharCode-5;
    }
  res.send({ decryptedMessage: originalNumber });
});

