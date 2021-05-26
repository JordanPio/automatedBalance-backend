const express = require("express");
const app = express();
const cors = require("cors");
const balanceController = require("./controllers/balanceController");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/", require("./router"));

const server = app.listen(5000, () => {
  console.log("server started on port 5000");
});

server.timeout = 10 * 60 * 1000; // necessary when running async functions that will take ages to complete
