const { Pool } = require("pg");

const pool = new Pool({
  user: 'admin_01',
  database: 'users',
  password: 'a3PV1i96X0ce',
  port: 5432,
  host: 'localhost',
});

module.exports = { pool };