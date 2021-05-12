const Balance = require("../models/Balance");

exports.apiGetContasPagas = function (req, res) {
  let balance = new Balance(
    req.body,
    req.query.prevBalanceDate,
    req.query.currentBalanceDate,
    req.query.newBalanceDate
  );
  balance
    .queryContasPagasPeriod()
    .then((results) => {
      res.json(results);
    })
    .catch((errors) => {
      res.json(errors);
    });
};

exports.apiGetBalanceTable = function (req, res) {
  let balance = new Balance(
    req.body,
    req.query.prevBalanceDate,
    req.query.currentBalanceDate,
    req.query.newBalanceDate
  );
  balance
    .queryBalanceTable()
    .then((results) => {
      res.json(results);
    })
    .catch((errors) => {
      res.json(errors);
    });
};

exports.apiGetCashflowReceivable = function (req, res) {
  let balance = new Balance(
    req.body,
    req.query.prevBalanceDate,
    req.query.currentBalanceDate,
    req.query.newBalanceDate
  );

  balance
    .queryCashflowReceivable()
    .then((results) => {
      res.json(results);
    })
    .catch((errors) => {
      res.json(errors);
    });
};

exports.apiGetCashflowPayable = function (req, res) {
  let balance = new Balance(
    req.body,
    req.query.prevBalanceDate,
    req.query.currentBalanceDate,
    req.query.newBalanceDate
  );

  balance
    .queryCashflowPayable()
    .then((results) => {
      res.json(results);
    })
    .catch((errors) => {
      res.json(errors);
    });
};

exports.apiGetOnlineSales = function (req, res) {
  let balance = new Balance(
    req.body,
    req.query.prevBalanceDate,
    req.query.currentBalanceDate,
    req.query.newBalanceDate
  );

  balance
    .queryVendasOnline()
    .then((results) => {
      res.json(results);
    })
    .catch((errors) => {
      res.json(errors);
    });
};

exports.apiGetStock = function (req, res) {
  let balance = new Balance(
    req.body,
    req.query.prevBalanceDate,
    req.query.currentBalanceDate,
    req.query.newBalanceDate
  );
  balance
    .queryStock()
    .then((results) => {
      res.json(results);
    })
    .catch((errors) => {
      res.json(errors);
    });
};

exports.apiGetTotalSales = function (req, res) {
  let balance = new Balance(
    req.body,
    req.query.prevBalanceDate,
    req.query.currentBalanceDate,
    req.query.newBalanceDate
  );
  balance
    .queryTotalSales()
    .then((results) => {
      res.json(results);
    })
    .catch((errors) => {
      res.json(errors);
    });
};

exports.apiGetDreSales = function (req, res) {
  let balance = new Balance(
    req.body,
    req.query.prevBalanceDate,
    req.query.currentBalanceDate,
    req.query.newBalanceDate
  );
  balance
    .queryDreSales()
    .then((results) => {
      res.json(results);
    })
    .catch((errors) => {
      res.json(errors);
    });
};

exports.apiGetAccPaidTable = function (req, res) {
  let balance = new Balance(
    req.body,
    req.query.prevBalanceDate,
    req.query.currentBalanceDate,
    req.query.newBalanceDate
  );
  balance
    .queryAccPaidTable()
    .then((results) => {
      res.json(results);
    })
    .catch((errors) => {
      res.json(errors);
    });
};

exports.apiGetPurchaseReturns = function (req, res) {
  let balance = new Balance(
    req.body,
    req.query.prevBalanceDate,
    req.query.currentBalanceDate,
    req.query.newBalanceDate
  );
  balance
    .queryReturns()
    .then((results) => {
      res.json(results);
    })
    .catch((errors) => {
      res.json(errors);
    });
};

exports.apiInsert = function (req, res) {
  let balance = new Balance(req.body);
  balance
    .insert()
    .then((results) => {
      res.json(results);
    })
    .catch((errors) => {
      res.json(errors);
    });
};

exports.apiGetAccReceivable = function (req, res) {
  let balance = new Balance(
    req.body,
    req.query.prevBalanceDate,
    req.query.currentBalanceDate,
    req.query.newBalanceDate
  );
  balance
    .queryAccReceivable()
    .then((results) => {
      res.json(results);
    })
    .catch((errors) => {
      res.json(errors);
    });
};

exports.apiGetAccReceivableDue = function (req, res) {
  let balance = new Balance(
    req.body,
    req.query.prevBalanceDate,
    req.query.currentBalanceDate,
    req.query.newBalanceDate
  );
  balance
    .queryAccReceivableDue()
    .then((results) => {
      res.json(results);
    })
    .catch((errors) => {
      res.json(errors);
    });
};

exports.getApiAccPayableTable = function (req, res) {
  let balance = new Balance(
    req.body,
    req.query.prevBalanceDate,
    req.query.currentBalanceDate,
    req.query.newBalanceDate
  );
  balance
    .queryAccPayableTb()
    .then((results) => {
      res.json(results);
    })
    .catch((errors) => {
      res.json(errors);
    });
};

exports.apiGetTotalAccPayable = function (req, res) {
  let balance = new Balance(
    req.body,
    req.query.prevBalanceDate,
    req.query.currentBalanceDate,
    req.query.newBalanceDate
  );
  balance
    .queryTotalAccPayable()
    .then((results) => {
      res.json(results);
    })
    .catch((errors) => {
      res.json(errors);
    });
};

exports.apiGetBillsByAccType = function (req, res) {
  let balance = new Balance(
    req.body,
    req.query.prevBalanceDate,
    req.query.currentBalanceDate,
    req.query.newBalanceDate
  );
  balance
    .queryBillsByAccType()
    .then((results) => {
      res.json(results);
    })
    .catch((errors) => {
      res.json(errors);
    });
};

exports.apiGetBillsByDescription = function (req, res) {
  let balance = new Balance(
    req.body,
    req.query.prevBalanceDate,
    req.query.currentBalanceDate,
    req.query.newBalanceDate
  );
  balance
    .queryBillsByDescription()
    .then((results) => {
      res.json(results);
    })
    .catch((errors) => {
      res.json(errors);
    });
};

exports.apiEdit = function (req, res) {
  let balance = new Balance(req.query.date);
  balance
    .edit()
    .then((results) => {
      res.json(results);
    })
    .catch((errors) => {
      res.json(errors);
    });
};

exports.apiDelete = function (req, res) {
  let balance = new Balance(req.body.date);
  balance
    .delete()
    .then((results) => {
      res.json(results);
    })
    .catch((errors) => {
      res.json(errors);
    });
};

exports.apiScrapeData = function (req, res) {
  let balance = new Balance(
    req.body,
    req.body.lastDateScrape,
    req.body.currentDateScrape
  );
  balance
    .scrapeAll()
    .then((results) => {
      res.json(results);
    })
    .catch((errors) => {
      res.json(errors);
    });
};

exports.apiUpdateBalance = function (req, res) {
  let balance = new Balance(req.body.data);
  balance
    .update()
    .then((results) => {
      res.json(results);
    })
    .catch((errors) => {
      res.json(errors);
    });
};
