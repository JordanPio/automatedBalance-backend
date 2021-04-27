const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");

const scraper = require("./ScrapesMain");
const pgp = require("pg-promise")({
  capSQL: true
});

const config = {
  user: process.env.USERDB,
  password: process.env.PASSWORDDB,
  dateStrings: true,
  max: 30, //use up to 30 connections
  host: process.env.HOST,
  port: process.env.PORT,
  database: process.env.DATABASE
};

const pool2 = pgp(config);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const server = app.listen(5000, () => {
  console.log("server started on port 5000");
});

server.timeout = 10 * 60 * 1000; // necessary when running async functions that will take ages to complete

//Queries

app.get("/totalPagar", async (req, res) => {
  try {
    let currentBalanceDate = req.query.currentDate;
    if (req.query.newDate > currentBalanceDate) {
      currentBalanceDate = req.query.newDate;
    }
    const receberTabela = await pool.query(`select data, SUM(saldo) as TOTAL from apagar where data='${currentBalanceDate}'group by data`);
    res.json(receberTabela.rows);
  } catch (error) {
    console.error(error.message, "when requesting pagarTabela");
  }
});

app.get("/pagarTabela", async (req, res) => {
  try {
    let currentBalanceDate = req.query.currentDate;
    if (req.query.newDate > currentBalanceDate) {
      currentBalanceDate = req.query.newDate;
    }
    const receberTabela = await pool.query(`select conta, sum(saldo) as total, (sum(saldo)/sum(sum(saldo)) over()) as percenttotal from apagar where data ='${currentBalanceDate}' group by conta order by total desc`);
    res.json(receberTabela.rows);
  } catch (error) {
    console.error(error.message, "when requesting pagarTabela");
  }
});

// Query that filteres everything out and leave only Despesas
app.get("/pagasTabela", async (req, res) => {
  try {
    let prevBalanceDate = req.query.prevBalanceDate;
    let currentBalanceDate = req.query.currentBalanceDate;
    if (req.query.newBalanceDate > currentBalanceDate) {
      prevBalanceDate = currentBalanceDate;
      currentBalanceDate = req.query.newBalanceDate;
    }
    const receberTabela = await pool.query(`select 
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

    from pagas 
    where datapagamento >='${prevBalanceDate}' and datapagamento <='${currentBalanceDate}' 
    and conta not ilike '%Retirada%' and conta not ilike '%Mercadoria%' and conta not ilike '%Imposto%' and conta not ilike '%Devolu%' 
    and conta not ilike '%Mercado Livre%' and conta not ilike '%Diferen%'

    group by conta, descricao order by total desc`);
    res.json(receberTabela.rows);
  } catch (error) {
    console.error(error.message);
  }
});

app.get("/pagasTest", async (req, res) => {
  try {
    let prevBalanceDate = req.query.prevBalanceDate;
    let currentBalanceDate = req.query.currentBalanceDate;
    if (req.query.newBalanceDate > currentBalanceDate) {
      prevBalanceDate = currentBalanceDate;
      currentBalanceDate = req.query.newBalanceDate;
    }
    const receberTabela = await pool.query(`select 
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
    where datapagamento >='${prevBalanceDate}' and datapagamento <='${currentBalanceDate}' 
    and conta not ilike '%Retirada%' and conta not ilike '%Mercadoria%' 
    group by conta, descricao order by total desc`);
    res.json(receberTabela.rows);
  } catch (error) {
    console.error(error.message);
  }
});

app.get("/pagasByContas", async (req, res) => {
  try {
    let prevBalanceDate = req.query.prevBalanceDate;
    let currentDate = req.query.currentBalanceDate;
    if (req.query.newBalanceDate > currentDate) {
      prevBalanceDate = req.query.currentBalanceDate;
      currentDate = req.query.newBalanceDate;
    }
    const receberTabela = await pool.query(`select conta, json_object_agg(month, total ORDER BY month) FROM
    (select conta, date_trunc('month', datapagamento::date) as month, sum(pago) as total from pagas 
    where datapagamento >='${prevBalanceDate}' and datapagamento <='${currentDate}' and conta not like '%Mercadoria%' 
    GROUP BY conta, month order by conta, month) s group by conta order by conta`);
    res.json(receberTabela.rows);
  } catch (error) {
    console.error(error.message);
  }
});

app.get("/pagasByDescricao", async (req, res) => {
  try {
    let prevBalanceDate = req.query.prevBalanceDate;
    let currentBalanceDate = req.query.currentBalanceDate;
    if (req.query.newBalanceDate > currentBalanceDate) {
      prevBalanceDate = currentBalanceDate;
      currentBalanceDate = req.query.newBalanceDate;
    }

    const receberTabela = await pool.query(`select conta, descricao, json_object_agg(month, total ORDER BY month) FROM (SELECT conta, descricao, date_trunc('month', datapagamento::date) as month, sum(pago) as total FROM pagas where datapagamento >='${prevBalanceDate}' and datapagamento <='${currentBalanceDate}' and conta not like '%Mercadoria%' GROUP BY conta, descricao, month) s GROUP BY conta, descricao ORDER BY conta, descricao`);
    res.json(receberTabela.rows);
  } catch (error) {
    console.error(error.message);
  }
});

app.get("/devolucoes", async (req, res) => {
  try {
    let prevBalanceDate = req.query.prevBalanceDate;
    let currentBalanceDate = req.query.currentBalanceDate;
    if (req.query.newBalanceDate > currentBalanceDate) {
      prevBalanceDate = currentBalanceDate;
      currentBalanceDate = req.query.newBalanceDate;
    }
    const receberTabela = await pool.query(`select descricao, sum(pago) as total from pagas 
    where datapagamento >='${prevBalanceDate}' and datapagamento <='${currentBalanceDate}' 
    and (conta ilike '%Dif%' or conta ilike '%Devolu%')
    group by descricao 
    order by total desc`);
    res.json(receberTabela.rows);
  } catch (error) {
    console.error(error.message);
  }
});

app.get("/cashflowReceber", async (req, res) => {
  try {
    let endDate = req.query.prevBalanceDate;
    if (req.query.currentBalanceDate > endDate) {
      endDate = req.query.currentBalanceDate;
    }
    const receberTabela = await pool.query(`select date_trunc('week', vencimento::date) as weekly, sum(saldo) as receber from receber where descricao not like '%CREDITO%' and data='${endDate}' group by weekly order by weekly`);
    res.json(receberTabela.rows);
  } catch (error) {
    console.error(error.message, "on CashflowReceber query");
  }
});

app.get("/cashflowPagar", async (req, res) => {
  try {
    let endDate = req.query.prevBalanceDate;

    if (req.query.currentBalanceDate > endDate) {
      endDate = req.query.currentBalanceDate;
    }

    const receberTabela = await pool.query(`select date_trunc('week', vencimento::date) as weekly, sum(saldo) from apagar where data='${endDate}' group by weekly order by weekly`);
    res.json(receberTabela.rows);
  } catch (error) {
    console.error(error.message, "on CashflowPagar query");
  }
});

app.get("/totalVendas", async (req, res) => {
  try {
    let prevBalanceDate = req.query.prevBalanceDate;
    let currentBalanceDate = req.query.currentBalanceDate;
    if (req.query.newBalanceDate > currentBalanceDate) {
      prevBalanceDate = currentBalanceDate;
      currentBalanceDate = req.query.newBalanceDate;
    }
    const receberTabela = await pool.query(`select sum(totalliquido) as TotalVendas from vendasperiodo where data >='${prevBalanceDate}'and data <='${currentBalanceDate}' order by totalvendas desc`);
    res.json(receberTabela.rows);
  } catch (error) {
    console.error(error.message);
  }
});

app.get("/vendasdre", async (req, res) => {
  try {
    let prevBalanceDate = req.query.prevBalanceDate;
    let currentBalanceDate = req.query.currentBalanceDate;
    if (req.query.newBalanceDate > currentBalanceDate) {
      prevBalanceDate = currentBalanceDate;
      currentBalanceDate = req.query.newBalanceDate;
    }
    const receberTabela = await pool.query(`select sum(totalvendas) as TotalVendido, sum(custototal) as TotalCusto, sum(lucro) as TotalLucro from vendastotais where de='${prevBalanceDate}' and ate='${currentBalanceDate}'`);
    res.json(receberTabela.rows);
  } catch (error) {
    console.error(error.message);
  }
});

app.get("/vendasOnline", async (req, res) => {
  try {
    let prevBalanceDate = req.query.prevBalanceDate;
    let currentBalanceDate = req.query.currentBalanceDate;
    if (req.query.newBalanceDate > currentBalanceDate) {
      prevBalanceDate = currentBalanceDate;
      currentBalanceDate = req.query.newBalanceDate;
    }
    const receberTabela = await pool.query(`select cliente, TotalVendas 
    from
    (select cliente, sum(totalliquido) as TotalVendas from vendasperiodo where data >='${prevBalanceDate}'and data <='${currentBalanceDate}' group by cliente order by totalvendas desc) s
    where cliente='B2W'or cliente like '%MAGAZINE%' or cliente like '%Mercado%'`);
    res.json(receberTabela.rows);
  } catch (error) {
    console.error(error.message);
  }
});

app.get("/receberTabela", async (req, res) => {
  try {
    let currentBalanceDate = req.query.currentDate;
    if (req.query.newDate > currentBalanceDate) {
      currentBalanceDate = req.query.newDate;
    }
    const receberTabela = await pool.query(`select cliente, sum(saldo) as TOTAL, (sum(saldo)/sum(sum(saldo)) over ()) as percentage from receber where descricao not like '%CREDITO%' and data='${currentBalanceDate}' group by cliente order by total desc`);
    res.json(receberTabela.rows);
  } catch (error) {
    console.error(error.message);
  }
});

app.get("/receberAtrasadas", async (req, res) => {
  try {
    let currentBalanceDate = req.query.currentDate;
    if (req.query.newDate > currentBalanceDate) {
      currentBalanceDate = req.query.newDate;
    }
    const receberTabela = await pool.query(`select cliente, sum(saldo) total from receber where descricao not like '%CREDITO%' and data='${currentBalanceDate}' and vencimento < now()::date group by cliente order by total desc`);
    res.json(receberTabela.rows);
  } catch (error) {
    console.error(error.message);
  }
});

app.get("/totalReceber", async (req, res) => {
  try {
    const receberTabela = await pool.query("select data, SUM(saldo) as TOTAL from receber where descricao not like '%CREDITO%' and data='2020-08-27' group by data");
    res.json(receberTabela.rows);
  } catch (error) {
    console.error(error.message);
  }
});

app.get("/totalEstoque", async (req, res) => {
  try {
    let currentBalanceDate = req.query.currentBalanceDate;

    if (req.query.newBalanceDate > currentBalanceDate) {
      currentBalanceDate = req.query.newBalanceDate;
    }
    const receberTabela = await pool.query(`select date, SUM(custototal) as custototal from estoque where date ='${currentBalanceDate}' group by date`);
    res.json(receberTabela.rows);
  } catch (error) {
    console.error(error.message);
  }
});

app.get("/balance", async (req, res) => {
  try {
    const ativos = await pool.query("select conta, tipo, json_object_agg(data, (total, id) ORDER BY data) FROM ( SELECT conta, tipo, data, total, id FROM balanco GROUP BY conta, tipo, data, total, id) s GROUP BY conta, tipo ORDER BY conta");

    res.json(ativos.rows);
  } catch (error) {
    console.error(error.message);
  }
});

app.get("/edit", async (req, res) => {
  try {
    let date = req.query.date;

    const ativos = await pool.query(`SELECT * FROM balanco where data='${date}' order by conta`);

    res.json(ativos.rows);
  } catch (error) {
    console.error(error.message);
  }
});

app.delete("/delBalance", async (req, res) => {
  try {
    let date = req.body.date;

    const response = await pool.query(`DELETE FROM balanco where data='${date}'`);
    res.json("Success");
  } catch (error) {
    console.error(error.message);
  }
});

let counter = 0;
app.post("/scrapeAll", async (req, res) => {
  try {
    const attemptTimes = 2;
    await scraper.scrapeData(attemptTimes, req.body.lastDateScrape, req.body.currentDateScrape);
    await res.json("Scrape finished");
  } catch (error) {
    console.error(error.message);
    res.json("error");
  }
});

app.post("/updateBalance", async (req, res) => {
  try {
    let dataset = [];
    await Object.entries(req.body.data).forEach(([key, value]) => {
      let items = {};
      items["id"] = parseInt(key, 10);
      items["total"] = parseFloat(value);
      dataset.push(items);
    });
    const cs = new pgp.helpers.ColumnSet(["?id", "total"], { table: "balanco" });

    let update = pgp.helpers.update(dataset, cs) + " WHERE v.id = t.id";
    const updateTable = await pool2.result(update);

    res.json("Update Successful of ,", updateTable.rowCount, "rows ");
  } catch (error) {
    console.error(error.message);
  }
});

app.post("/insertBalance", async (req, res) => {
  insertionsCounted = 0;
  repeatedInsertionsRejected = 0;
  let dataset = req.body;

  try {
    if (dataset.data) {
      let myInsert = "INSERT INTO balanco (TIPO, CONTA, TOTAL, DATA) VALUES($1, $2, $3, $4) ON CONFLICT ON CONSTRAINT unique_idx_balanco DO NOTHING RETURNING * ";
      const insertInto = await pool.query(myInsert, [dataset.data.tipo, dataset.data.conta, dataset.data.total, dataset.data.date]);
      await res.json("Success, a total of ", insertInto.rowCount, " rows has been added to the Balanco Database");
    } else {
      const cs = new pgp.helpers.ColumnSet(["tipo", "conta", "total", "data"], { table: "balanco" });
      let insert = pgp.helpers.insert(dataset.dataBal, cs);
      const updateTable = await pool2.result(insert);
      await res.json("Success, a total of ", updateTable.rowCount, " rows has been addded to the Balanco Database");
    }
  } catch (error) {
    console.error(error.message);
  }
});
