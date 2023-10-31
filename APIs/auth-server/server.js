const cors = require('cors')
const express = require('express');
const fs = require('fs');
const https = require('https');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

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

app.post('/login', (req, res) => {
  console.log(req.body);
  const { username, password } = req.body;
  res.send({
    token: username
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