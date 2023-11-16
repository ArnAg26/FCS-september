const { pool } = require("../../databases/db");
const rateLimitMiddleware=require('/home/iiitd/project/APIs/auth-server/rateLimit.js');

const specialCharacters = ['!', '#', '$', '%', '^', '&', '*', '(', ')', '-', '_', '+', '=', '|', ';', '"', '<', '>', ',', '?'];
const cors = require('cors')
const express = require('express');
const fs = require('fs');
const https = require('https');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const axios = require('axios');
const app = express();
app.use(cors());
app.use(express.json());
const bcrypt=require('bcrypt');
const { authenticate } = require('/home/iiitd/project/APIs/auth-server/auth.js');
console.log(authenticate);
app.use(rateLimitMiddleware);
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

function sanitizeInput(input) {
  return !specialCharacters.some(specialChar => input.includes(specialChar));
}

async function deleteProperty(property_id) {
  try {
    const res = await pool.query("DELETE FROM property WHERE property_id = $1;", [property_id]);
    return res.rows;
  }
  catch (error) {
    console.error(error);
  }
}


// async function checkUser(username, password) {
//   try {
//     const res = await pool.query("SELECT * FROM userlist WHERE username = $1 AND password = $2;", [username, password]);
    
//     console.log(res.rows);
//     return res.rows;
//   }
//   catch (error) {
//     console.error(error);
//   }
// }


async function checkUser(username, password) {
  try {
    // Query the database for a user with the provided username
    const userQueryResult = await pool.query("SELECT * FROM userlist WHERE username = $1;", [username]);

    // Check if a user was found
    if (userQueryResult.rows.length > 0) {
      const user = userQueryResult.rows[0];

      // Use bcrypt to compare the provided password with the hashed password
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (isValidPassword) {
        // If the password is valid, return the user (or relevant user data)
        return { success: true, user: user };
      } else {
        // If the password is invalid, return a failure indication
        return { success: false, message: 'Invalid password' };
      }
    } else {
      // No user found with the provided username
      return { success: false, message: 'User not found' };
    }
  } catch (error) {
    console.error('Error in checkUser:', error);
    // Return an error message or indication
    return { success: false, message: 'Error checking user' };
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
    const res = await pool.query("SELECT property_id, user_id, address, type, price, status, created_at, updated_at, soldto FROM property WHERE user_id = $1;", [id]);
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

async function addProperty(user_id, address, type, price, status, fileName) {
  try {
    const res = await pool.query("INSERT INTO property (user_id, address, type, price, status, filename) VALUES ($1, $2, $3, $4, $5, $6);", [user_id, address, type, price, status, fileName]);
    return "success"
  }
  catch (error) {
    console.error(error);
    return "error";
  }
}

async function filterProperty(type, price) {
  try {
    const res = await pool.query("SELECT property_id, user_id, address, type, price, status FROM property WHERE (type = $1 OR $1 IS NULL) AND (price < $2 OR $2 IS NULL) AND status = 'available';", [type, price]);
    return res.rows;
  }
  catch (error) {
    console.error(error);
  }
}

// async function insertUser(username, password, name, type, email) {
//   try {
//     const res = await pool.query("INSERT INTO userlist (username, password, name, user_type, email) VALUES ($1, $2, $3, $4, $5);", [username, password, name, type, email]);
//     //also print the query
//     return res
//   } catch (error) {
//     console.error(error);
//   }
// }

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
    const res = await pool.query("SELECT property_id, user_id, address, type , price, status FROM property WHERE status = 'available';");
    return res.rows;
  }
  catch (error) {
    console.error(error);
  }
}

async function getAllPropertiesAdmin() {
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
    const res = await pool.query("SELECT user_id, username, name, email, user_type, created_at, updated_at FROM userlist;");
    return res.rows;
  }
  catch (error) {
    console.error(error);
  }
}
async function addToken(token,username) {
  try {
    const t=token.token;
    const res = await pool.query("UPDATE userlist SET token=$1 WHERE username=$2;", [t,username]);
    return res.rows;
  }
  catch (error) {
    console.error(error);
  }
}

async function purchaseProperty(property_id, buyerId) {
  try {
    const res = await pool.query("UPDATE property SET status = 'purchased' , soldto = $1 WHERE property_id = $2;", [buyerId, property_id]);
    return res.rows;
  }
  catch (error) {
    console.error(error);
    return { message: "error" }
  }
}

async function sellProperty(property_id) {
  try {
    "select * from contracts where id = $1"
    const res = await pool.query("select * from contracts where id = $1", [property_id]);
    return res.rows;
  }
  catch (error) {
    console.error(error);
    return { message: "error" }
  }
}

async function getBoughtProperties(id) {
  console.log("GET BOUGHT PROPERTIES");
  try {
    const res = await pool.query("SELECT * FROM property WHERE soldto = $1;", [id]);
    return res.rows;
  }
  catch (error) {
    console.error(error);
  }
}

async function getEmailfromID(id) {
  try {
    const res = await pool.query("SELECT email FROM userlist WHERE user_id = $1;", [id]);
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


app.post('/getProperties',authenticate,async (req, res) => {
  const { id } = req.body;
  // if(!sanitizeInput(id)){
  //   res.status(400).send({success:false,message:"Invalid Input"});
  // }
  getUserProperties(id).then((data) => {
    res.send(data);
  }
  );
});

app.post('/updateProperty',authenticate, (req, res) => {
  console.log("POST /updateProperty");
  const { id, name, value } = req.body;

  updateProperty(id, name, value).then((data) => {
    res.send(data);
  }
  );
});

// app.post('/canLogin', (req, res) => {
//   const { username, password } = req.body;
//   checkUser(username, password).then((data) => {
//     res.send(data);
//   }
//   );
// }
// );

app.post('/canLogin', async (req, res) => {
  const { username, password } = req.body;
  // if(!sanitizeInput(username)){
  //   res.status(400).send({ success: false, message: 'Invalid input' });
  // }
  // if(!sanitizeInput(password)){
  //   res.status(400).send({ success: false, message: 'Invalid input' });
  // }
  try {
    const data = await checkUser(username, password);

    if (data.success) {
      res.status(200).send(data); // Send success response
    } else {
      res.status(401).send({ success: false, message: 'Invalid credentials' }); // Send unauthorized response
    }
  } catch (error) {
    console.log(1);
    console.error(error);
    res.status(500).send({ success: false, message: 'Internal server error' }); // Send server error response
  }
});



async function insertUser(username, password, name, type, email) {
  try {
    const saltRounds = 10; // Or more
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log(hashedPassword);
    const res = await pool.query("INSERT INTO userlist (username, password, name, user_type, email) VALUES ($1, $2, $3, $4, $5);", [username, hashedPassword, name, type, email]);
    console.log(res);
    return res
  } catch (error) {
    console.error(error);
  }
}

app.post('/insertUser', (req, res) => {

  const { username, password, name, dateOfBirth, btype, email } = req.body;
  // if(!sanitizeInput(username)){
  //   res.status(400).send({ success: false, message: 'Invalid input' });
  // }
  // if(!sanitizeInput(password)){
  //   res.status(400).send({ success: false, message: 'Invalid input' });
  // }
  // if(!sanitizeInput(name)){
  //   res.status(400).send({ success: false, message: 'Invalid input' });
  // }
  // if(!sanitizeInput(btype)){
  //   res.status(400).send({ success: false, message: 'Invalid input' });
  // }
  // if(!sanitizeInput(email)){
  //   res.status(400).send({ success: false, message: 'Invalid input' });
  // }
  let type = btype;
  insertUser(username, password, name, type, email).then((data) => {
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
app.post('/addToken', (req, res) => {
  const { token,username } = req.body;
  addToken(token,username).then((data) => {
    res.send(data);
  }
  );
});
async function getToken(username) {
  try {
    const res = await pool.query("SELECT token FROM userlist WHERE username = $1;", [username]);
    return res.rows;
  }
  catch (error) {
    console.error(error);
  }
}
app.post('/getToken', (req, res) => {
  const { username } = req.body;

  getToken(username).then((data) => {
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


app.post('/deleteProperty',authenticate,async (req, res) => {
  const { property_id } = req.body;
  // if(!sanitizeInput(property_id)){
  //   res.status(400).send({success:false,message:"Invalid Input"});
  // }

  deleteProperty(property_id).then((data) => {
    res.send(data);
  }
  );
});


app.post('/getAllProperties',authenticate, async (req, res) => {
  // console.log("Hi");
  // console.log('how are you')
  const { id } = req.body;
  // if(!sanitizeInput(id)){
  //   console.log(id);
  //   res.status(400).send({success:false,message:"Invalid Input"});
  // }

  if (id == 42) {
    getAllProperties().then((data) => {
      res.send(data);
    }
    );
  }
  else
    res.send("INVALID USER");

});

app.post('/getAllPropertiesAdmin',authenticate, async (req, res) => {

  const { id } = req.body;
  // if(!sanitizeInput(id)){
  //   res.status(400).send({success:false,message:"Invalid Input"});
  // }

  if (id == 42) {
    getAllPropertiesAdmin().then((data) => {
      res.send(data);
    }
    );
  }
  else
    res.send("INVALID USER");

});



app.post('/getAllUser',authenticate,async (req, res) => {

  const { id } = req.body;
  // if(!sanitizeInput(id)){
  //   res.status(400).send({success:false,message:"Invalid Input"});
  // }

  if (id == 42) {
    getAllUsers().then((data) => {
      res.send(data);
    }
    );
  }
  else
    res.send("INVALID USER");

});


app.post('/addProperty',authenticate,async (req, res) => {

  const { user_id, address, type, price, fileName } = req.body;
  // if(!sanitizeInput(user_id)){
  //   res.status(400).send({success:false,message:"Invalid Input"});
  // }

  // if(!sanitizeInput(address)){
  //   res.status(400).send({ success: false, message: 'Invalid input' });
  // }
  // if(!sanitizeInput(type)){
  //   res.status(400).send({ success: false, message: 'Invalid input' });
  // }
  // if(!sanitizeInput(price)){
  //   res.status(400).send({ success: false, message: 'Invalid input' });
  // }
  let status = "pending";
  addProperty(user_id, address, type, price, status, fileName).then((data) => {
    res.send({ message: data });
  }
  );
});

app.post('/filterProperty',authenticate,async (req, res) => {

  const { type, price } = req.body;
  // if(!sanitizeInput(type)){
  //   res.status(400).send({success:false,message:"Invalid Input"});
  // }
  // if(!sanitizeInput(price)){
  //   res.status(400).send({success:false,message:"Invalid Input"});
  // }
  filterProperty(type, price).then((data) => {
    res.send(data);
  }
  );
});

app.post('/purchaseProperty',authenticate, async (req, res) => {

  const { property_id, buyerId } = req.body;
  // if(!sanitizeInput(property_id)){
  //   res.status(400).send({success:false,message:"Invalid Input"});
  // }
  // if(!sanitizeInput(buyerId)){
  //   res.status(400).send({success:false,message:"Invalid Input"});
  // }
  purchaseProperty(property_id, buyerId).then((data) => {
    res.send(data);
  }
  );
});

app.post('/sellProperty',authenticate,async (req, res) => {
  const { property_id } = req.body;
  // if(!sanitizeInput(property_id)){
  //   res.status(400).send({success:false,message:"Invalid Input"});
  // }

  sellProperty(property_id).then((data) => {
    res.send(data);
  }
  );
});

app.post('/buyerBoughtProperties',authenticate,async (req, res) => {
  const { id } = req.body;
  // if(!sanitizeInput(id)){
  //   res.status(400).send({success:false,message:"Invalid Input"});
  // }

  getBoughtProperties(id).then((data) => {
    res.send(data);
  }
  );
});

app.post('/buyingotp', async (req, res) => {
  const { buyerId } = req.body;
  const { sellerId } = req.body;
  // let email;
  // getEmailfromID(buyerId).then((data) => {
  //   console.log(data[0].email)
  //   email = data[0].email;
  // }
  // );
  try {
    const getEmail = await getEmailfromID(buyerId);
    const email = getEmail[0].email;
    let tosendobject = { "email": email };
    let response = await axios.post('https://192.168.2.241:5000/otp', tosendobject);
    console.log(response.data);
    const getName = await pool.query("SELECT name FROM userlist WHERE user_id = $1;", [buyerId]);
    response.data.buyerName = getName.rows[0].name;
    const getName2 = await pool.query("SELECT name FROM userlist WHERE user_id = $1;", [sellerId]);
    response.data.sellerName = getName2.rows[0].name;
    console.log(response.data);
    res.send(response.data);
  }
  catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }

});


app.post('/addContract', async (req, res) => {
  const { buyerId } = req.body;
  const { sellerId } = req.body;
  const { buyerContract } = req.body;
  const { sellerContract } = req.body;
  try {
    const response = await pool.query("INSERT INTO contracts (id, type, contract) VALUES ($1, $2, $3);", [buyerId, "buyer", buyerContract]);
    const response2 = await pool.query("INSERT INTO contracts (id, type, contract) VALUES ($1, $2, $3);", [sellerId, "seller", sellerContract]);
    res.send(response.rows);
  }
  catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/approveProperty',authenticate, async (req, res) => {
  const { property_id } = req.body;
  // if(!sanitizeInput(property_id)){
  //   res.status(400).send({success:false,message:"Invalid Input"});
  // }

  try {
    const response = await pool.query("UPDATE property SET status = 'available' WHERE property_id = $1;", [property_id]);
    res.send(response.rows);
  }
  catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/deleteUser',authenticate, async (req, res) => {
  const { user_id } = req.body;
  // if(!sanitizeInput(user_id)){
  //   res.status(400).send({success:false,message:"Invalid Input"});
  // }

  try {
    const response = await pool.query("DELETE FROM userlist WHERE user_id = $1;", [user_id]);
    res.send(response.rows);
  }
  catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}
);

app.post('/updatePropertyFiles',authenticate, async (req, res) => {
  const { property_id, fileName } = req.body;
  // if(!sanitizeInput(property_id)){
  //   res.status(400).send({success:false,message:"Invalid Input"});
  // }
  try {
    const response = await pool.query("UPDATE property SET filename = $1 WHERE property_id = $2;", [fileName, property_id]);
    const response2 = await pool.query("UPDATE property SET status = 'pending' WHERE property_id = $1;", [property_id]);
    res.send(response.rows);
  }
  catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}
);