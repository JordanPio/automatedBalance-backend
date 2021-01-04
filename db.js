const Pool = require("pg").Pool;
const dotenv = require("dotenv");
dotenv.config();

const types = require("pg").types;
types.setTypeParser(20, function (val) {
  return parseInt(val);
});

types.setTypeParser(1700, function (val) {
  return parseFloat(val);
});

// types.setTypeParser(790, function (val) {
//   return parseFloat(val);
// });

const pool = new Pool({
  user: process.env.USERDB,
  password: process.env.PASSWORDDB,
  dateStrings: true,
  host: process.env.HOST,
  port: process.env.PORT,
  database: process.env.DATABASE
});

module.exports = pool;
