const cors = require('cors')
const express = require('express');

const https = require('https');

const axios = require('axios');
const app = express();
app.use(cors());
app.use(express.json());
const crypto=require('crypto');

const secretKey = 'z9mnq913ffjkslat29fslj28ufskzaal9z1';

async function authenticate(req, res, next) {
    console.log("Middleware triggered");
    try{
      console.log(req.headers);
      const tokenString=req.headers['token'];
      console.log(tokenString);
      if (!tokenString) {
        return res.status(403).send({success:false,msg:'A token is required for authentication'});
      }
      const outerTokenObj= JSON.parse(tokenString);
      const tokenObj = outerTokenObj.token;
      console.log(tokenObj);
      const username=tokenObj.username;
      if (!tokenObj || !tokenObj.encryptedMessage) {
            return res.status(401).send({success:false,message:'Invalid Token'});
      }
      const decipher = crypto.createDecipher('aes-256-cbc', secretKey);
      let decryptedMessage = decipher.update(tokenObj.encryptedMessage, 'hex', 'utf-8');
      decryptedMessage += decipher.final('utf-8');
      console.log(decryptedMessage);
      const baseCharCode = 'a'.charCodeAt(0) - 1;
      let originalTime = '';
      for (let i = 0; i < decryptedMessage.length; i++) {
          const letter = decryptedMessage[i];
          const digit = letter.charCodeAt(0) - baseCharCode - 5;
          originalTime += String(digit);
        }
    
      const refDate = new Date("2020-01-01");
      const tokenDate = new Date(refDate.getTime() + parseInt(originalTime) * 1000);
    
        // Expiration:15 mins
      const now = new Date();
      if (now - tokenDate > 900000) { 
          return res.status(401).send({success:false,message:'Token expired'});
      }

    const response = await axios.post('https://192.168.2.241:8081/getToken', {
        username: username
    });
    console.log(response);
    console.log(response.data[0]);
    const tokenDB=JSON.parse(response.data[0].token);

    if(JSON.stringify(tokenDB)!==JSON.stringify(tokenObj)){
        return res.status(401).send({success:false,message:'Illegal token'});
    }
    next(); 
    }catch(error){
      return res.status(400).send({success:false,message:'Invalid token format'});
    }

  }

module.exports ={ authenticate };