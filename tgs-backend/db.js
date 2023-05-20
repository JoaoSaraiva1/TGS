const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "smart_farming_db",
  password: "joaoename",
  port: 5432,
});

module.exports = pool;
