const pool = require("../db");
const scraper = require("../ScrapesMain");
const pgp = require("pg-promise")({
  capSQL: true,
});

const config = {
  user: process.env.USERDB,
  password: process.env.PASSWORDDB,
  dateStrings: true,
  max: 30, //use up to 30 connections
  host: process.env.HOST,
  port: process.env.PORT,
  database: process.env.DATABASE,
};

const pool2 = pgp(config);

let Balance = function (
  data,
  prevBalanceDate,
  currentBalanceDate,
  newBalanceDate
) {
  this.data = data;
  this.errors = [];
  this.prevBalanceDate = prevBalanceDate;
  this.currentBalanceDate = currentBalanceDate;
  this.newBalanceDate = newBalanceDate;
  if (this.newBalanceDate > this.currentBalanceDate) {
    this.prevBalanceDate = this.currentBalanceDate;
    this.currentBalanceDate = this.newBalanceDate;
  }
};

Balance.prototype.genRandomId = function () {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

Balance.prototype.queryContasPagasPeriod = function () {
  return new Promise(async (resolve, reject) => {
    try {
      // if (this.newBalanceDate > this.currentBalanceDate) {
      //   this.prevBalanceDate = this.currentBalanceDate;
      //   this.currentBalanceDate = this.newBalanceDate;
      // }

      let contasPagas = await pool.query(`select 
      conta, descricao, sum(pago) as TOTAL, (sum(pago)/ sum(sum(pago)) over ()) as percenttotal,
      
      CASE
      WHEN "conta" ilike '%comiss%' and descricao ilike '%b2w%' THEN 'Taxas B2W'
      WHEN "conta" ilike '%devolu%' and descricao ilike '%b2w%' THEN 'Devolucao B2W'
      WHEN "conta" ilike '%dif%' and descricao ilike '%b2w%' THEN 'Devolucao B2W'
      WHEN "conta" ilike '%frete%' and descricao ilike '%b2w%' THEN 'Frete B2W'
      
      WHEN "conta" ilike '%devolu%' and descricao ilike '%magazine%' THEN 'Devolucao Magazine'
      WHEN "conta" ilike '%dif%' and descricao ilike '%magazine%' THEN 'Devolucao Magazine'
      WHEN "conta" ilike '%comiss%' and descricao ilike '%magazine%' THEN 'Taxas Magazine'
      WHEN "conta" ilike '%frete%' and descricao ilike '%magazine%' THEN 'Frete Magazine'
      
      WHEN "conta" ilike '%devolu%' and descricao ilike '%Mercado%' THEN 'Devolucao Mercado Livre'
      WHEN "conta" ilike '%dif%' and descricao ilike '%Mercado%' THEN 'Devolucao Mercado Livre'
      WHEN ("conta" ilike '%comiss%' or "conta" ilike '%Tarifas Banc%') and descricao ilike '%Mercado%' THEN 'Taxas Mercado Livre'
      WHEN "conta" ilike '%frete%' and descricao ilike '%Mercado%' THEN 'Frete Mercado Livre'
      ELSE '-'
      END AS "custom" 
      
      from pagas 
      where datapagamento >='${this.prevBalanceDate}' and datapagamento <='${this.currentBalanceDate}' 
      and conta not ilike '%Retirada%' and conta not ilike '%Mercadoria%' 
      group by conta, descricao order by total desc`);

      resolve(contasPagas.rows);
    } catch {
      reject();
    }
  });
};

Balance.prototype.pivotTable = function (balanceDataObj) {
  if (!balanceDataObj || Object.keys(balanceDataObj).length === 0) return {};

  let refactBalanceDataArr = [];
  let balanceDates = [];
  let balanceValues = [];
  let totalsPerAccount = {};

  totalsPerAccount["Ativo Circulante"] = {};
  totalsPerAccount["Ativo Permanente"] = {};
  totalsPerAccount["Ativo"] = {};
  totalsPerAccount["Passivo"] = {};
  totalsPerAccount["Passivo Circulante"] = {};
  totalsPerAccount["Passivo Exigivel a Longo Prazo"] = {};
  totalsPerAccount["Patrimonio Liquido"] = {};
  totalsPerAccount["Capital Social"] = {};
  totalsPerAccount["Lucro Exercicio"] = {};
  totalsPerAccount["DifAtivPassiv"] = {};

  for (let i = 0; i < balanceDataObj.length; i++) {
    balanceDates = Object.keys(balanceDataObj[i].json_object_agg);
    balanceValues = Object.values(balanceDataObj[i].json_object_agg);

    let tempRefactBalData = {};
    tempRefactBalData["conta"] = balanceDataObj[i].conta;
    tempRefactBalData["tipo"] = balanceDataObj[i].tipo;

    for (let j = 0; j < balanceDates.length; j++) {
      let date = balanceDates[j];
      let value = balanceValues[j];
      tempRefactBalData[date] = value;

      // // Initiate object for adding calculated totals
      totalsPerAccount["Ativo Circulante"][date] = 0;
      totalsPerAccount["Ativo Permanente"][date] = 0;
      totalsPerAccount["Ativo"][date] = 0;
      totalsPerAccount["Passivo"][date] = 0;
      totalsPerAccount["Passivo Circulante"][date] = 0;
      totalsPerAccount["Passivo Exigivel a Longo Prazo"][date] = 0;
      totalsPerAccount["Patrimonio Liquido"][date] = 0;
      totalsPerAccount["Capital Social"][date] = 0;
      totalsPerAccount["Lucro Exercicio"][date] = 0;
      totalsPerAccount["DifAtivPassiv"][date] = 0;
    }

    refactBalanceDataArr.push(tempRefactBalData);
  }

  totalsPerAccount = this.calcAccountTotals(
    totalsPerAccount,
    refactBalanceDataArr,
    balanceDates
  );

  let uniqDates = balanceDates.map((items) => {
    return { id: this.genRandomId(), data: items, select: true };
  });

  const currentBalanceDate = uniqDates.slice(-1)[0];
  const prevBalanceDate = uniqDates.slice(-2)[0];

  const analysisPerPeriod = this.statsPerPeriod(balanceDates, totalsPerAccount);
  // console.log(analysisPerPeriod);

  const refactDataObj = {
    dates: uniqDates,
    dadosPivot: refactBalanceDataArr,
    totais: totalsPerAccount,
    analysisPerPeriod,
    currentBalanceDate,
    prevBalanceDate,
  };

  return refactDataObj;
};

Balance.prototype.calcAccountTotals = function (
  totalsPerAccount,
  refactBalanceDataArr,
  balanceDates
) {
  refactBalanceDataArr.forEach((items) => {
    if (items.tipo === "Ativo Circulante") {
      balanceDates.forEach((dt) => {
        items[dt] !== undefined
          ? (totalsPerAccount["Ativo Circulante"][dt] =
              totalsPerAccount["Ativo Circulante"][dt] + items[dt].f1)
          : (totalsPerAccount["Ativo Circulante"][dt] =
              totalsPerAccount["Ativo Circulante"][dt] + 0);
      });
    } else if (items.tipo === "Ativo Permanente") {
      balanceDates.forEach((dt) => {
        totalsPerAccount["Ativo Permanente"][dt] =
          totalsPerAccount["Ativo Permanente"][dt] + items[dt].f1;
      });
    } else if (items.tipo === "Passivo Circulante") {
      balanceDates.forEach((dt) => {
        if (items[dt] !== undefined) {
          totalsPerAccount["Passivo Circulante"][dt] =
            totalsPerAccount["Passivo Circulante"][dt] + items[dt].f1;
        } else {
          totalsPerAccount["Passivo Circulante"][dt] =
            totalsPerAccount["Passivo Circulante"][dt] + 0;
        }
      });
    } else if (
      items.tipo === "Patrimonio Liquido" ||
      items.tipo === "Profit Loss"
    ) {
      balanceDates.forEach((dt) => {
        if (items[dt] !== undefined) {
          totalsPerAccount["Patrimonio Liquido"][dt] =
            totalsPerAccount["Patrimonio Liquido"][dt] + items[dt].f1;
          if (items.conta === "Lucro Prejuizo do Exercicio") {
            totalsPerAccount["Lucro Exercicio"][dt] =
              totalsPerAccount["Lucro Exercicio"][dt] + items[dt].f1;
          }
        } else {
          totalsPerAccount["Patrimonio Liquido"][dt] =
            totalsPerAccount["Patrimonio Liquido"][dt] + 0;

          if (items.conta === "Lucro Prejuizo do Exercicio") {
            totalsPerAccount["Lucro Exercicio"][dt] =
              totalsPerAccount["Lucro Exercicio"][dt] + 0;
          }
        }
      });
    } else if (items.tipo === "Passivo Exigivel a Longo Prazo") {
      balanceDates.forEach((dt) => {
        if (items[dt] !== undefined) {
          totalsPerAccount["Passivo Exigivel a Longo Prazo"][dt] =
            totalsPerAccount["Passivo Exigivel a Longo Prazo"][dt] +
            items[dt].f1;
        } else {
          totalsPerAccount["Passivo Exigivel a Longo Prazo"][dt] =
            totalsPerAccount["Passivo Exigivel a Longo Prazo"][dt] + 0;
        }
      });
    }
  });

  balanceDates.forEach((dt) => {
    totalsPerAccount["Ativo"][dt] =
      totalsPerAccount["Ativo Circulante"][dt] +
      totalsPerAccount["Ativo Permanente"][dt];
    totalsPerAccount["Passivo"][dt] =
      totalsPerAccount["Patrimonio Liquido"][dt] +
      totalsPerAccount["Passivo Circulante"][dt] +
      totalsPerAccount["Passivo Exigivel a Longo Prazo"][dt];
    totalsPerAccount["DifAtivPassiv"][dt] =
      totalsPerAccount["Ativo"][dt] - totalsPerAccount["Passivo"][dt];
  });

  return totalsPerAccount;
};

Balance.prototype.statsPerPeriod = function (datas, totais) {
  let analysisPerPeriod = {};

  // Initiate Objects
  let circulante = {};
  let crescPeriodo = {};
  let liquidezGeral = {};
  let mesPeriodo = {};
  let lucroMensal = {};

  for (let i = datas.length - 1; i >= 0; i--) {
    if (datas[i - 1] !== undefined) {
      // console.log(datas);
      circulante[datas[i]] =
        totais["Ativo Circulante"][datas[i]] /
        totais["Passivo Circulante"][datas[i]];
      crescPeriodo[datas[i]] = totais["Lucro Exercicio"][datas[i]];
      liquidezGeral[datas[i]] =
        totais["Ativo"][datas[i]] / totais["Passivo"][datas[i]];

      // // qtde meses que passou entre periodo
      (function calcProfitPeriod() {
        const d1Y = new Date(datas[i]).getFullYear();
        const d2Y = new Date(datas[i - 1]).getFullYear();
        const d1M = new Date(datas[i]).getMonth();
        const d2M = new Date(datas[i - 1]).getMonth();

        mesPeriodo[datas[i]] = d1M + 12 * d1Y - (d2M + 12 * d2Y);
        lucroMensal[datas[i]] = crescPeriodo[datas[i]] / mesPeriodo[datas[i]];
      })();

      // Cover edge case for first balance (As we dont have the previous balance data)
    } else {
      circulante[datas[i]] =
        totais["Ativo Circulante"][datas[i]] /
        totais["Passivo Circulante"][datas[i]];
      crescPeriodo[datas[i]] = totais["Lucro Exercicio"][datas[i]];
      liquidezGeral[datas[i]] =
        totais["Ativo"][datas[i]] / totais["Passivo"][datas[i]];

      mesPeriodo[datas[i]] = 22;
      lucroMensal[datas[i]] = crescPeriodo[datas[i]] / mesPeriodo[datas[i]];
    }
  }
  analysisPerPeriod.circulante = circulante;
  analysisPerPeriod.crescPeriodo = crescPeriodo;
  analysisPerPeriod.liquidezGeral = liquidezGeral;
  analysisPerPeriod.mesPeriodo = mesPeriodo;
  analysisPerPeriod.lucroMensal = lucroMensal;

  // console.log(analysisPerPeriod); // como arrumar essa parte agora ?

  return analysisPerPeriod;
};

Balance.prototype.queryBalanceTable = function () {
  return new Promise(async (resolve, reject) => {
    try {
      let balanceTable = await pool.query(
        `select conta, tipo, json_object_agg(data, (total, id) ORDER BY data) 
        FROM ( SELECT conta, tipo, data, total, id 
          FROM balanco 
          GROUP BY conta, tipo, data, total, id) s 
          GROUP BY conta, tipo ORDER BY conta`
      );
      const refactData = await this.pivotTable(balanceTable.rows);
      resolve(refactData);
    } catch {
      reject();
    }
  });
};

Balance.prototype.queryCashflowReceivable = function () {
  return new Promise(async (resolve, reject) => {
    try {
      const cashflowReceivable = await pool.query(
        `select date_trunc('week', vencimento::date) as weekly, sum(saldo) as receber 
        FROM receber 
        WHERE descricao not like '%CREDITO%' and data='${this.currentBalanceDate}' 
        GROUP BY weekly order by weekly`
      );
      resolve(cashflowReceivable.rows);
    } catch {
      reject();
    }
  });
};

Balance.prototype.queryCashflowPayable = function () {
  return new Promise(async (resolve, reject) => {
    try {
      const cashflowPayable = [
        { pagar: 29557.01, weekly: "2021-04-18T14:00:00.000Z" },
      ];
      resolve(cashflowPayable);
    } catch {
      reject();
    }
  });
};

Balance.prototype.calcCashflow = function (payableObj, receivableObj) {
  if (
    !payableObj ||
    !receivableObj ||
    Object.keys(payableObj).length === 0 ||
    Object.keys(receivableObj).length === 0
  )
    return {};

  // for (let index = 0; index < re.length; index++) {

  // }
};

Balance.prototype.queryVendasOnline = function () {
  return new Promise(async (resolve, reject) => {
    try {
      const vendasOnline = await pool.query(`SELECT cliente, TotalVendas
      
      FROM (select cliente, sum(totalliquido) as TotalVendas 
      FROM vendasperiodo 
      WHERE data >='${this.prevBalanceDate}'and data <='${this.currentBalanceDate}' 
      GROUP BY cliente order by totalvendas desc) s 
        WHERE cliente='B2W'or cliente like '%MAGAZINE%' or cliente like '%Mercado%'`);
      resolve(vendasOnline.rows);
    } catch {
      reject();
    }
  });
};

Balance.prototype.queryStock = function () {
  return new Promise(async (resolve, reject) => {
    try {
      const stock = await pool.query(
        `SELECT date, SUM(custototal) as custototal 
          FROM estoque 
          WHERE date ='${this.currentBalanceDate}' 
          GROUP BY date`
      );
      resolve(stock.rows);
    } catch {
      reject();
    }
  });
};

Balance.prototype.queryTotalSales = function () {
  return new Promise(async (resolve, reject) => {
    try {
      const totalSales =
        await pool.query(`SELECT sum(totalliquido) as TotalVendas 
      FROM vendasperiodo 
      WHERE data >='${this.prevBalanceDate}'and data <='${this.currentBalanceDate}' 
      ORDER BY totalvendas DESC`);
      resolve(totalSales.rows);
    } catch {
      reject();
    }
  });
};

Balance.prototype.queryDreSales = function () {
  return new Promise(async (resolve, reject) => {
    try {
      const dreSales =
        await pool.query(`SELECT sum(totalvendas) as TotalVendido, sum(custototal) as TotalCusto, sum(lucro) as TotalLucro 
      FROM vendastotais 
      WHERE de='${this.prevBalanceDate}' and ate='${this.currentBalanceDate}'`);
      resolve(dreSales.rows);
    } catch {
      reject();
    }
  });
};

Balance.prototype.queryAccPaidTable = function () {
  return new Promise(async (resolve, reject) => {
    try {
      const accPaidTable = await pool.query(`SELECT
      conta, descricao, sum(pago) as TOTAL, (sum(pago)/ sum(sum(pago)) over ()) as percenttotal,
      
      CASE
      WHEN "conta" ilike '%comiss%' and descricao ilike '%b2w%' THEN 'Taxas B2W'
      WHEN "conta" ilike '%comiss%' and descricao ilike '%magazine%' THEN 'Taxas Magazine'
      WHEN ("conta" ilike '%comiss%' or "conta" ilike '%Tarifas Banc%') and descricao ilike '%Mercado%' THEN 'Taxas Mercado Livre'
      WHEN "conta" ilike '%frete%' and descricao ilike '%b2w%' THEN 'Frete B2W'
      WHEN "conta" ilike '%frete%' and descricao ilike '%magazine%' THEN 'Frete Magazine'
      WHEN "conta" ilike '%frete%' and descricao ilike '%Mercado%' THEN 'Frete Mercado Livre'
      
      ELSE '-'
      END AS "custom"
      
      FROM pagas
      WHERE datapagamento >='${this.prevBalanceDate}' and datapagamento <='${this.currentBalanceDate}'
      and conta not ilike '%Retirada%' and conta not ilike '%Mercadoria%' and conta not ilike '%Imposto%' and conta not ilike '%Devolu%'
      and conta not ilike '%Mercado Livre%' and conta not ilike '%Diferen%'
      
      GROUP BY conta, descricao order by total desc`);
      resolve(accPaidTable.rows);
    } catch {
      reject();
    }
  });
};

Balance.prototype.queryReturns = function () {
  return new Promise(async (resolve, reject) => {
    try {
      const returns =
        await pool.query(`SELECT descricao, sum(pago) as total from pagas
      WHERE datapagamento >='${this.prevBalanceDate}' and datapagamento <='${this.currentBalanceDate}'
      AND (conta ilike '%Dif%' OR conta ilike '%Devolu%')
      GROUP BY descricao
      ORDER BY total desc`);
      resolve(returns.rows);
    } catch {
      reject();
    }
  });
};

Balance.prototype.insert = function () {
  return new Promise(async (resolve, reject) => {
    try {
      let insertionsCounted = 0;
      let repeatedInsertionsRejected = 0;
      const dataset = this.data;

      if (dataset.data) {
        let myInsert =
          "INSERT INTO balanco (TIPO, CONTA, TOTAL, DATA) VALUES($1, $2, $3, $4) ON CONFLICT ON CONSTRAINT unique_idx_balanco DO NOTHING RETURNING * ";

        const insertInto = await pool.query(myInsert, [
          dataset.data.tipo,
          dataset.data.conta,
          dataset.data.total,
          dataset.data.date,
        ]);
        resolve(
          "Success, a total of ",
          insertInto.rowCount,
          " rows has been added to the Balanco Database"
        );
      } else {
        const cs = new pgp.helpers.ColumnSet(
          ["tipo", "conta", "total", "data"],
          {
            table: "balanco",
          }
        );
        let insert = pgp.helpers.insert(dataset.dataBal, cs);
        const updateTable = await pool2.result(insert);
        resolve(
          "Success, a total of ",
          updateTable.rowCount,
          " rows has been addded to the Balanco Database"
        );
      }
    } catch {
      reject();
    }
  });
};

Balance.prototype.queryAccReceivable = function () {
  return new Promise(async (resolve, reject) => {
    try {
      const accReceivable = await pool.query(`SELECT 
      cliente, sum(saldo) as TOTAL, (sum(saldo)/sum(sum(saldo)) over ()) as percentage 
      FROM receber 
      WHERE descricao NOT LIKE '%CREDITO%' AND data='${this.currentBalanceDate}' 
      GROUP BY cliente 
      ORDER by total desc`);
      resolve(accReceivable.rows);
    } catch {
      reject();
    }
  });
};

Balance.prototype.queryAccReceivableDue = function () {
  return new Promise(async (resolve, reject) => {
    try {
      const accReceivableDue = await pool.query(`SELECT 
      cliente, sum(saldo) total 
      from receber 
      where descricao 
      not like '%CREDITO%' and data='${this.currentBalanceDate}' and vencimento < now()::date 
      group by cliente 
      order by total desc`);
      resolve(accReceivableDue.rows);
    } catch {
      reject();
    }
  });
};

Balance.prototype.queryAccPayableTb = function () {
  return new Promise(async (resolve, reject) => {
    try {
      const accPayableTb = await pool.query(
        `select conta, sum(saldo) as total, (sum(saldo)/sum(sum(saldo)) over()) as percenttotal 
        from apagar 
        where data ='${this.currentBalanceDate}' 
        group by conta 
        order by total desc`
      );
      resolve(accPayableTb.rows);
    } catch {
      reject();
    }
  });
};

Balance.prototype.queryTotalAccPayable = function () {
  return new Promise(async (resolve, reject) => {
    try {
      const totalAccPayable =
        await pool.query(`select data, SUM(saldo) as TOTAL 
      from apagar 
      where data='${this.currentBalanceDate}'
      group by data`);
      resolve(totalAccPayable.rows);
    } catch {
      reject();
    }
  });
};

Balance.prototype.queryBillsByAccType = function () {
  return new Promise(async (resolve, reject) => {
    try {
      const BillsByAccType =
        await pool.query(`select conta, json_object_agg(month, total ORDER BY month) 
      FROM
        (select conta, date_trunc('month', datapagamento::date) as month, sum(pago) as total 
        from pagas
        where datapagamento >='${this.prevBalanceDate}' and datapagamento <='${this.currentBalanceDate}' and conta not like '%Mercadoria%'
        GROUP BY conta, month 
        order by conta, month) s 
      group by conta order by conta`);
      resolve(BillsByAccType.rows);
    } catch {
      reject();
    }
  });
};

Balance.prototype.queryBillsByDescription = function () {
  return new Promise(async (resolve, reject) => {
    try {
      const BillsByDescription = await pool.query(
        `select conta, descricao, json_object_agg(month, total ORDER BY month) 
        FROM 
          (SELECT conta, descricao, date_trunc('month', datapagamento::date) as month, sum(pago) as total 
          FROM pagas where datapagamento >='${this.prevBalanceDate}' and datapagamento <='${this.currentBalanceDate}' and conta not like '%Mercadoria%' 
          GROUP BY conta, descricao, month) s 
        GROUP BY conta, descricao 
        ORDER BY conta, descricao`
      );
      resolve(BillsByDescription.rows);
    } catch {
      reject();
    }
  });
};

Balance.prototype.edit = function () {
  return new Promise(async (resolve, reject) => {
    try {
      const editItem = await pool.query(
        `SELECT * FROM balanco where data='${this.data}' order by conta`
      );
      resolve(editItem.rows);
    } catch {
      reject();
    }
  });
  w;
};

Balance.prototype.delete = function () {
  return new Promise(async (resolve, reject) => {
    try {
      const deleteItem = await pool.query(
        `DELETE FROM balanco where data='${this.data}'`
      );
      resolve("the item was succesfuly deleted");
    } catch {
      reject("error deleting item");
    }
  });
};

Balance.prototype.scrapeAll = function () {
  return new Promise(async (resolve, reject) => {
    try {
      const attemptTimes = 2;
      await scraper.scrapeData(
        attemptTimes,
        this.prevBalanceDate,
        this.currentBalanceDate
      );
      resolve("Scraper finished succesfully");
    } catch {
      reject("There was an issue scraping the data, please try again");
    }
  });
};

Balance.prototype.update = function () {
  return new Promise(async (resolve, reject) => {
    try {
      let dataset = [];
      await Object.entries(this.data).forEach(([key, value]) => {
        let items = {};
        items["id"] = parseInt(key, 10);
        items["total"] = parseFloat(value);
        dataset.push(items);
      });
      const cs = new pgp.helpers.ColumnSet(["?id", "total"], {
        table: "balanco",
      });

      let update = pgp.helpers.update(dataset, cs) + " WHERE v.id = t.id";
      const updateTable = await pool2.result(update);

      resolve("Items were updated succesfully", updateTable.rowCount);
    } catch {
      reject("error updating items");
    }
  });
};

module.exports = Balance;
