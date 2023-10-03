// app.use(cors());
// const bodyParser = require('body-parser');
// const app = express();
// app.use(bodyParser.json()); 

// app.use('/login', (req, res) => {
  //   const { username, password } = req.body;
//   res.send({
  //     token: username
  //   });
  // });
  
  // app.listen(8080, () => console.log('API is running on http://localhost:8080/login'));

const cors = require('cors')
const express = require('express');
const fs = require('fs');
const https = require('https');

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
  // console.log(`Server is running on https://${address.address}:${address.port}`);
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

