const apiRouter = require("express").Router();
const cors = require("cors");
const balanceController = require("./controllers/balanceController");

apiRouter.use(cors());

apiRouter.get("/totalPagar", balanceController.apiGetTotalAccPayable);
apiRouter.get("/pagarTabela", balanceController.getApiAccPayableTable);
apiRouter.get("/pagasTabela", balanceController.apiGetAccPaidTable);
apiRouter.get("/pagasTest", balanceController.apiGetContasPagas);
apiRouter.get("/pagasDetails", balanceController.apiGetBillsDetails);
// apiRouter.get("/pagasByDescricao", balanceController.apiGetBillsByDescription);

apiRouter.get("/devolucoes", balanceController.apiGetPurchaseReturns);

apiRouter.get(
  "/cashflowProjection",
  balanceController.apiGetCashflowProjection
);
// apiRouter.get("/cashflowPagar", balanceController.apiGetCashflowPayable);

apiRouter.get("/totalVendas", balanceController.apiGetTotalSales);
apiRouter.get("/vendasdre", balanceController.apiGetDreSales);
apiRouter.get("/vendasOnline", balanceController.apiGetOnlineSales);

apiRouter.get("/receberDetails", balanceController.apiGetAccReceivable);
// apiRouter.get("/receberAtrasadas", balanceController.apiGetAccReceivableDue);

apiRouter.get("/totalEstoque", balanceController.apiGetStock);

apiRouter.get("/balance", balanceController.apiGetBalanceTable);
apiRouter.get("/edit", balanceController.apiEdit);
apiRouter.delete("/delBalance", balanceController.apiDelete);

apiRouter.post("/scrapeAll", balanceController.apiScrapeData);
apiRouter.post("/updateBalance", balanceController.apiUpdateBalance);

apiRouter.post("/insertBalance", balanceController.apiInsert);

module.exports = apiRouter;
