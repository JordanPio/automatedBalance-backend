const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");
// const datb = require("./db");
// const pool = datb.pool;
// const pool2 = datb.pool2;
const scraper = require("./ScrapesMain");
const pgp = require("pg-promise")({
  capSQL: true // capitalize all generated SQL
});

const config = {
  user: process.env.USERDB,
  password: process.env.PASSWORDDB,
  dateStrings: true, //not sure if this goes here
  max: 30, //use up to 30 connections
  host: process.env.HOST,
  port: process.env.PORT,
  database: process.env.DATABASE
};

const pool2 = pgp(config);

// MIDDLEWARE
app.use(cors());
app.use(express.json()); // req.body
app.use(express.urlencoded({ extended: false }));

const server = app.listen(5000, () => {
  console.log("server started on port 5000");
});

server.timeout = 10 * 60 * 1000; // this will allow for the server to not timout the requests so the client doesnt send another request thinking that the response failed
// in other words this is complete necessary when running async functions that will take ages to complete

//Queries

app.get("/totalPagar", async (req, res) => {
  try {
    let endDate = req.query.lastDate;
    if (req.query.currentDate > endDate) {
      endDate = req.query.currentDate;
    }
    const receberTabela = await pool.query(`select data, SUM(saldo) as TOTAL from apagar where data='${endDate}'group by data`);
    res.json(receberTabela.rows);
  } catch (error) {
    console.error(error.message);
  }
});

app.get("/pagarTabela", async (req, res) => {
  try {
    let endDate = req.query.lastDate;
    if (req.query.currentDate > endDate) {
      endDate = req.query.currentDate;
    }
    const receberTabela = await pool.query(`select conta, sum(saldo) as total, (sum(saldo)/sum(sum(saldo)) over()) as percenttotal from apagar where data ='${endDate}' group by conta order by total desc`);
    res.json(receberTabela.rows);
  } catch (error) {
    console.error(error.message);
  }
});

app.get("/pagasTabela", async (req, res) => {
  try {
    let previousDate = req.query.secondLastDate;
    let endDate = req.query.lastDate;
    if (req.query.currentDate > req.query.lastDate) {
      previousDate = req.query.lastDate;
      endDate = req.query.currentDate;
    }
    const receberTabela = await pool.query(`select conta, sum(pago) as TOTAL, (sum(pago)/ sum(sum(pago)) over ()) as percenttotal from pagas where datapagamento >='${previousDate}' and datapagamento <='${endDate}' and conta not like '%Retirada%' and conta not like '%Mercadoria%' and conta not like '%Impostos%' and conta not like '%Frete%' and conta not like '%Tarifas Mercado Livre%' and conta not like '%Difere%' and descricao not like '%TARIFAS B2W%' and descricao not like '%COMISSAO B2W%' and descricao not like '%COMISSAO MAGAZINE LUIZA%' group by conta order by total desc`);
    res.json(receberTabela.rows);
  } catch (error) {
    console.error(error.message);
  }
});

app.get("/pagasByContas", async (req, res) => {
  try {
    // console.log(req.query);

    let previousDate = req.query.secondLastDate;
    let endDate = req.query.lastDate;
    if (req.query.currentDate > req.query.lastDate) {
      previousDate = req.query.lastDate;
      endDate = req.query.currentDate;
    }
    // console.log(previousDate, endDate);
    const receberTabela = await pool.query(`select conta, json_object_agg(month, total ORDER BY month) FROM
    (select conta, date_trunc('month', datapagamento::date) as month, sum(pago) as total from pagas 
    where datapagamento >='${previousDate}' and datapagamento <='${endDate}' and conta not like '%Mercadoria%' 
    GROUP BY conta, month order by conta, month) s group by conta order by conta`);
    res.json(receberTabela.rows);
  } catch (error) {
    console.error(error.message);
  }
});

app.get("/pagasByDescricao", async (req, res) => {
  try {
    let previousDate = req.query.secondLastDate;
    let endDate = req.query.lastDate;
    if (req.query.currentDate > req.query.lastDate) {
      previousDate = req.query.lastDate;
      endDate = req.query.currentDate;
    }

    const receberTabela = await pool.query(`select conta, descricao, json_object_agg(month, total ORDER BY month) FROM (SELECT conta, descricao, date_trunc('month', datapagamento::date) as month, sum(pago) as total FROM pagas where datapagamento >='${previousDate}' and datapagamento <='${endDate}' and conta not like '%Mercadoria%' GROUP BY conta, descricao, month) s GROUP BY conta, descricao ORDER BY conta, descricao`);
    res.json(receberTabela.rows);
  } catch (error) {
    console.error(error.message);
  }
});

app.get("/devolucoes", async (req, res) => {
  try {
    let previousDate = req.query.secondLastDate;
    let endDate = req.query.lastDate;
    if (req.query.currentDate > req.query.lastDate) {
      previousDate = req.query.lastDate;
      endDate = req.query.currentDate;
    }
    const receberTabela = await pool.query(`select descricao, sum(pago) as total from pagas where datapagamento >='${previousDate}' and datapagamento <='${endDate}' and conta like '%Dif%' group by descricao order by total desc;`);
    res.json(receberTabela.rows);
  } catch (error) {
    console.error(error.message);
  }
});

app.get("/cashflowReceber", async (req, res) => {
  try {
    let endDate = req.query.lastDate;
    if (req.query.currentDate > endDate) {
      endDate = req.query.currentDate;
    }
    const receberTabela = await pool.query(`select date_trunc('week', vencimento::date) as weekly, sum(saldo) as receber from receber where descricao not like '%CREDITO%' and data='${endDate}' group by weekly order by weekly`);
    res.json(receberTabela.rows);
  } catch (error) {
    console.error(error.message);
  }
});

app.get("/cashflowPagar", async (req, res) => {
  try {
    let endDate = req.query.lastDate;

    if (req.query.currentDate > endDate) {
      endDate = req.query.currentDate;
    }

    const receberTabela = await pool.query(`select date_trunc('week', vencimento::date) as weekly, sum(saldo) from apagar where data='${endDate}' group by weekly order by weekly`);
    res.json(receberTabela.rows);
  } catch (error) {
    console.error(error.message);
  }
});

app.get("/totalVendas", async (req, res) => {
  try {
    let previousDate = req.query.secondLastDate;
    let endDate = req.query.lastDate;
    if (req.query.currentDate > req.query.lastDate) {
      previousDate = req.query.lastDate;
      endDate = req.query.currentDate;
    }
    // console.log(previousDate, endDate);
    // console.log(req.query);
    const receberTabela = await pool.query(`select sum(totalliquido) as TotalVendas from vendasperiodo where data >='${previousDate}'and data <='${endDate}' order by totalvendas desc`);
    res.json(receberTabela.rows);
  } catch (error) {
    console.error(error.message);
  }
});

app.get("/vendasdre", async (req, res) => {
  try {
    let previousDate = req.query.secondLastDate;
    let endDate = req.query.lastDate;
    if (req.query.currentDate > req.query.lastDate) {
      previousDate = req.query.lastDate;
      endDate = req.query.currentDate;
    }
    const receberTabela = await pool.query(`select sum(totalvendas) as TotalVendido, sum(custototal) as TotalCusto, sum(lucro) as TotalLucro from vendastotais where de='${previousDate}' and ate='${endDate}'`);
    res.json(receberTabela.rows);
  } catch (error) {
    console.error(error.message);
  }
});

app.get("/vendasOnline", async (req, res) => {
  try {
    let previousDate = req.query.secondLastDate;
    let endDate = req.query.lastDate;
    if (req.query.currentDate > req.query.lastDate) {
      previousDate = req.query.lastDate;
      endDate = req.query.currentDate;
    }
    const receberTabela = await pool.query(`select cliente, TotalVendas 
    from
    (select cliente, sum(totalliquido) as TotalVendas from vendasperiodo where data >='${previousDate}'and data <='${endDate}' group by cliente order by totalvendas desc) s
    where cliente='B2W'or cliente like '%MAGAZINE%' or cliente like '%Mercado%'`);
    // old query
    // const receberTabela = await pool.query(`select cliente, sum(totalliquido) as TotalVendas from vendasperiodo where data >='${previousDate}'and data <='${endDate}' and cliente='B2W' or cliente like '%MAGAZINE%' or cliente like '%Mercado%' group by cliente order by totalvendas desc`);
    res.json(receberTabela.rows);
  } catch (error) {
    console.error(error.message);
  }
});

app.get("/receberTabela", async (req, res) => {
  try {
    let endDate = req.query.lastDate;
    if (req.query.currentDate > endDate) {
      endDate = req.query.currentDate;
    }
    const receberTabela = await pool.query(`select cliente, sum(saldo) as TOTAL, (sum(saldo)/sum(sum(saldo)) over ()) as percentage from receber where descricao not like '%CREDITO%' and data='${endDate}' group by cliente order by total desc`);
    res.json(receberTabela.rows);
  } catch (error) {
    console.error(error.message);
  }
});

app.get("/receberAtrasadas", async (req, res) => {
  try {
    let endDate = req.query.lastDate;
    if (req.query.currentDate > endDate) {
      endDate = req.query.currentDate;
    }
    const receberTabela = await pool.query(`select cliente, sum(saldo) total from receber where descricao not like '%CREDITO%' and data='${endDate}' and vencimento < now()::date group by cliente order by total desc`);
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
    // console.log(req.query);
    let endDate = req.query.lastDate;

    if (req.query.currentDate > endDate) {
      endDate = req.query.currentDate;
    }
    const receberTabela = await pool.query(`select date, SUM(custototal) as custototal from estoque where date ='${endDate}' group by date`);
    res.json(receberTabela.rows);
  } catch (error) {
    console.error(error.message);
  }
});

app.get("/balance", async (req, res) => {
  try {
    const ativos = await pool.query("select conta, tipo, json_object_agg(data, (total, id) ORDER BY data) FROM ( SELECT conta, tipo, data, total, id FROM balanco GROUP BY conta, tipo, data, total, id) s GROUP BY conta, tipo ORDER BY conta");

    // old query
    // const ativos = await pool.query("select conta, tipo, json_object_agg(data, total ORDER BY data) FROM ( SELECT conta, tipo, data, total FROM balanco GROUP BY conta, tipo, data, total) s GROUP BY conta, tipo ORDER BY conta; ");
    // const ativos = await pool.query("SELECT conta, data, total FROM balanco GROUP BY conta, data, total ORDER BY conta crosstabview; ");
    // const ativos = await pool.query("select * from balanco");

    res.json(ativos.rows);
  } catch (error) {
    console.error(error.message);
  }
});


app.get("/edit", async (req, res) => {
  try {
    let date = req.query.date;
    // console.log(date)

    const ativos = await pool.query(`SELECT * FROM balanco where data='${date}' order by id`);
    // const ativos = await pool.query(`select conta, tipo, json_object_agg(data, (total, id) ORDER BY data) FROM ( SELECT conta, tipo, data, total, id FROM balanco where data='${date}' GROUP BY conta, tipo, data, total, id) s GROUP BY conta, tipo ORDER BY conta`);

    // old query
    // const ativos = await pool.query("select conta, tipo, json_object_agg(data, (total, id) ORDER BY data) FROM ( SELECT conta, tipo, data, total, id FROM balanco GROUP BY conta, tipo, data, total, id) s GROUP BY conta, tipo ORDER BY conta");

    // const ativos = await pool.query("select conta, tipo, json_object_agg(data, total ORDER BY data) FROM ( SELECT conta, tipo, data, total FROM balanco GROUP BY conta, tipo, data, total) s GROUP BY conta, tipo ORDER BY conta; ");
    // const ativos = await pool.query("SELECT conta, data, total FROM balanco GROUP BY conta, data, total ORDER BY conta crosstabview; ");
    // const ativos = await pool.query("select * from balanco");

    res.json(ativos.rows);
  } catch (error) {
    console.error(error.message);
  }
});

app.delete("/delBalance", async (req, res) => {
  try {
    let date = req.body.date;
    // console.log(date);

    const response = await pool.query(`DELETE FROM balanco where data='${date}'`);

    res.json("Success");
  } catch (error) {
    console.error(error.message);
  }
});

let counter = 0;
app.post("/scrapeAll", async (req, res) => {
  try {
    // console.log(req.body);
    // console.log(req.body.currentDate);
    const attemptTimes = 2;
    // res.json("Scrape Initiated"); // fix this response
    await scraper.scrapeData(attemptTimes, req.body.lastDateScrape, req.body.currentDateScrape);
    await res.json("Scrape finished");

    // counter = counter + 1;
    // console.log(req.body.lastDateScrape, req.body.currentDateScrape, counter);
  } catch (error) {
    console.error(error.message);
    res.json("error");
  }
});

app.post("/updateBalance", async (req, res) => {
  try {
    // console.log(req.body.data, "req.body.data"); // check rq.body
    let dataset = [];
    await Object.entries(req.body.data).forEach(([key, value]) => {
      let items = {};
      items["id"] = parseInt(key, 10);
      items["total"] = parseFloat(value);
      dataset.push(items);
    });
    // console.log(dataset); // check dataset
    const cs = new pgp.helpers.ColumnSet(["?id", "total"], { table: "balanco" });
    // console.log(cs); // check cs

    let update = pgp.helpers.update(dataset, cs) + " WHERE v.id = t.id";
    // console.log(update); // check query
    const updateTable = await pool2.result(update);

    // old attempt
    // let items = [];
    // Object.entries(req.body.data).forEach(([key, value]) => items.push(parseInt(key, 10), value));
    // console.log(items);

    // let myUpdate = `UPDATE balanco b
    // set total = b.total
    // from unnest(array[(5,1), (15,1)]) b (total int, id int)
    // `;

    // const receberTabela = await pool.query(myUpdate);
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
      // console.log("Simples", dataset.data);
      let myInsert = "INSERT INTO balanco (TIPO, CONTA, TOTAL, DATA) VALUES($1, $2, $3, $4) ON CONFLICT ON CONSTRAINT unique_idx_balanco DO NOTHING RETURNING * ";
      // console.log(dataset.data.tipo, dataset.data.conta, dataset.data.total, dataset.data.date)
      const insertInto = await pool.query(myInsert, [dataset.data.tipo, dataset.data.conta, dataset.data.total, dataset.data.date]);
      await res.json("Success, a total of ", insertInto.rows, " rows has been added to the Balanco Database");
    } else {
      // console.log("Composto", dataset.dataBal);
      const cs = new pgp.helpers.ColumnSet(["tipo", "conta", "total", "data"], { table: "balanco" });
      let insert = pgp.helpers.insert(dataset.dataBal, cs);
      // console.log(insert);
      const updateTable = await pool2.result(insert);
      await res.json("Success, a total of ", updateTable.rowCount, " rows has been addded to the Balanco Database");
    }
  } catch (error) {
    console.error(error.message);
  }
});
