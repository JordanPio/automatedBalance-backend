// describe("Addition", () => {
//   it("knows that 2 and 2 make 4", () => {
//     expect(2 + 2).toBe(4);
//   });
// });
// const express = require("express");
// const app = express();
// const cors = require("cors");

// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

// jest.mock("../__mocks__/Balance");
const balanceController = require("../controllers/balanceController");
const Balance = require("../models/Balance");

// let results = {};

// test("query results", async () => {
//   //   const objDates = {
//   //     query: { prevBalanceDate: "2021-03-18", currentBalanceDate: "2021-04-18" },
//   //   };

//   const balance = new Balance("any", "2021-03-18", "2021-04-18");
//   let payable = await balance.queryCashflowPayable().then((result) => {
//     expect(result).toEqual([{}]);
//   });
//   //   let receivable = await balance.queryCashflowReceivable();

//   //   console.log(payable[0]["weekly"]);
//   //   console.log(receivable[0]["weekly"]);

//   //   for (let i = 0; i < receivable.length; i++) {
//   //     // console.log(receivable[i].weekly);
//   //     if (receivable[i].weekly === payable[i].weekly) {
//   //       //   receivable[i]["pagar"] = payable[i].pagar;
//   //       console.log("HELLO");
//   //     } else {
//   //       //   let dtPayable = payable[i].weekly;
//   //       receivable.push(payable[i]);
//   //       //   console.log(dtPayable);
//   //       //   receivable[i];
//   //     }
//   //   }

//   //   expect(payable).toBeDefined();
//   //   expect(payable).toEqual([{}]);
// });

test("query results", async () => {
  const balance = new Balance("any", "2021-03-18", "2021-04-18");
  let payable = await balance.queryCashflowPayable().then((result) => {
    return result;
  });

  let receivable = await balance.queryCashflowReceivable().then((result) => {
    return result;
  });

  let calc = await balance.calcCashflow(payable, receivable);
  expect(calc.length).toEqual(45);
  expect(calc).to;
});
