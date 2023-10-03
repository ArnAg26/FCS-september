const { pool } = require("../../databases/db");

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

server.listen(8081, () => {
  const address = server.address();
  console.log(`Server is running on https://localhost:${address.port}`);
  // console.log(`Server is running on https://${address.address}:${address.port}`);
});

app.get('/', (req, res) => {
  res.send("Hello from express serverss")
});


async function deleteProperty(property_id) {
  try {
    const res = await pool.query("DELETE FROM property WHERE property_id = $1;", [property_id]);
    return res.rows;
  }
  catch (error) {
    console.error(error);
  }
}
  

async function checkUser(username, password) {
  try {
    const res = await pool.query("SELECT * FROM userlist WHERE username = $1 AND password = $2;", [username, password]);
    console.log(res.rows);
    return res.rows;
  }
  catch (error) {
    console.error(error);
  }
}

async function retrieveData() {
  try {
    const res = await pool.query("SELECT * FROM userlist");
    return res.rows;
  } catch (error) {
    console.error(error);
  }
};

async function getUserProperties(id) {
  try {
    const res = await pool.query("SELECT * FROM property WHERE user_id = $1;", [id]);
    return res.rows;
  } catch (error) {
    console.error(error);
  }
}

async function updateProperty(id, name, value) {
  try {
    // UPDATE Property SET address = 'New Address', type = 'New Type', price = New_Price, status = 'New Status' WHERE property_id = [Property_id] AND user_id = [Seller_or_Lessor_user_id];
    column = name;
    const res = await pool.query("UPDATE property SET " + column + " = $1 WHERE property_id = $2;", [value, id]);
    // const res = await pool.query("UPDATE property SET $1 = $2 WHERE property_id = $3;", [name, value, id]);
    return res.rows;
  } catch (error) {
    console.error(error);
  }
}

async function insertUser(username, password, name, type) {
  try {
    const res = await pool.query("INSERT INTO userlist (username, password, name, user_type) VALUES ($1, $2, $3, $4);", [username, password, name, type]);
    //also print the query
    return res
  } catch (error) {
    console.error(error);
  }
}

async function getUserid(username) {
  try {
    const res = await pool.query("SELECT user_id FROM userlist WHERE username = $1;", [username]);
    return res.rows;
  }
  catch (error) {
    console.error(error);
  }
}


async function getUsertype(username) {
  try {
    const res = await pool.query("SELECT user_type FROM userlist WHERE username = $1;", [username]);
    return res.rows;
  }
  catch (error) {
    console.error(error);
  }
}

async function getAllProperties() {
  try {
    console.log("GET ALL PROPERTIES");
    const res = await pool.query("SELECT * FROM property;");
    return res.rows;
  }
  catch (error) {
    console.error(error);
  }
}

async function getAllUsers() {
  try {
    console.log("GET ALL PROPERTIES");
    const res = await pool.query("SELECT * FROM userlist;");
    return res.rows;
  }
  catch (error) {
    console.error(error);
  }
}

async function getAllUsers() {
  try {
    const res = await pool.query("SELECT * FROM userlist;");
    return res.rows;
  }
  catch (error) {
    console.error(error);
  }
}


app.get('/sharks', (req, res) => {
  console.log("GET /sharks");
  retrieveData().then((data) => {
    res.send(data);
  });
});


app.post('/getProperties', (req, res) => {
  const { id } = req.body;
  getUserProperties(id).then((data) => {
    res.send(data);
  }
  );
});

app.post('/updateProperty', (req, res) => {
  console.log("POST /updateProperty");
  const { id, name, value } = req.body;
  updateProperty(id, name, value).then((data) => {
    res.send(data);
  }
  );
});

app.post('/canLogin', (req, res) => {
  const { username, password } = req.body;
  checkUser(username, password).then((data) => {
    res.send(data);
  }
  );
}
);


app.post('/insertUser', (req, res) => {
  const { username, password, name, dateOfBirth, btype } = req.body;
  let type = btype;
  insertUser(username, password, name, type).then((data) => {
    console.log(data);
    res.send(data);
  }
  );
});

app.post('/getUserid', (req, res) => {
  const { username } = req.body;
  getUserid(username).then((data) => {
    res.send(data);
  }
  );
});

app.post('/getUsertype', (req, res) => {
  const { username } = req.body;
  getUsertype(username).then((data) => {
    res.send(data);
  }
  );
});


app.post('/deleteProperty', (req, res) => {
  const { property_id } = req.body;
  deleteProperty(property_id).then((data) => {
    res.send(data);
  }
  );
});


app.post('/getAllProperties', (req, res) => {

  const { id } = req.body;
  if (id == 42) {
    getAllProperties().then((data) => {
      res.send(data);
    }
    );
  }
  else
    res.send("INVALID USER");

});

app.post('/getAllUser', (req, res) => {

  const { id } = req.body;
  if (id == 42) {
    getAllUsers().then((data) => {
      res.send(data);
    }
    );
  }
  else
    res.send("INVALID USER");

});