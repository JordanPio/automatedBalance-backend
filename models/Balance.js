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
      resolve(balanceTable.rows);
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
      const cashflowPayable = await pool.query(
        `select date_trunc('week', vencimento::date) as weekly, sum(saldo) 
        from apagar 
        where data='${this.currentBalanceDate}' 
        group by weekly order by weekly`
      );
      resolve(cashflowPayable.rows);
    } catch {
      reject();
    }
  });
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
      const totalSales = await pool.query(`SELECT sum(totalliquido) as TotalVendas 
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
      const dreSales = await pool.query(`SELECT sum(totalvendas) as TotalVendido, sum(custototal) as TotalCusto, sum(lucro) as TotalLucro 
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
      const returns = await pool.query(`SELECT descricao, sum(pago) as total from pagas
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
      const totalAccPayable = await pool.query(`select data, SUM(saldo) as TOTAL 
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
      const BillsByAccType = await pool.query(`select conta, json_object_agg(month, total ORDER BY month) 
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

module.exports = Balance;
