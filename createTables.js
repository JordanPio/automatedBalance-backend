const pool = require("./db");

async function createTableReceber() {
  try {
    await pool.query("DROP TABLE IF EXISTS receber");
    await pool.query("CREATE TABLE receber ( DATA date, CONTA TEXT, DESCRICAO TEXT, CLIENTE TEXT, VENCIMENTO date, TOTAL numeric(15,2), RECEBIDO numeric(15,2), SALDO numeric(15,2), CONSTRAINT unique_idx_receber UNIQUE (data, conta, descricao, cliente, vencimento, total, recebido) )", (err, res) => {
      //  await pool.query("CREATE TABLE pagas (ID serial PRIMARY KEY UNIQUE, CONTA VARCHAR(255), DESCRICAO VARCHAR(255), FORNECEDOR VARCHAR(255), VENCIMENTO date, DATAPAGAMENTO date, TOTAL numeric(15,2), PAGO numeric(15,2), SALDO numeric(15,2))", (err, res) => {
      console.log("Table created Succesfully");

      pool.end();
    });
  } catch (error) {
    console.error(error.message);
  }
}

// createTableReceber();

async function createTableVendas() {
  try {
    await pool.query("DROP TABLE IF EXISTS vendasTotais");
    await pool.query("CREATE TABLE vendasTotais ( DE date, ATE date, PRODUTO TEXT, QTDE NUMERIC, PRECOVENDA numeric(15,2), CUSTO numeric(15,2), CUSTOTOTAL numeric(15,2), PORCENTAGEMLUCRO decimal, LUCRO numeric(15,2), TOTALVENDAS numeric(15,2), CONSTRAINT unique_idx_vendas UNIQUE (de, ate, produto, qtde, lucro) )", (err, res) => {
      //  await pool.query("CREATE TABLE pagas (ID serial PRIMARY KEY UNIQUE, CONTA VARCHAR(255), DESCRICAO VARCHAR(255), FORNECEDOR VARCHAR(255), VENCIMENTO date, DATAPAGAMENTO date, TOTAL numeric(15,2), PAGO numeric(15,2), SALDO numeric(15,2))", (err, res) => {
      console.log("Table created Succesfully");
      pool.end();
    });
  } catch (error) {
    console.error(error.message);
  }
}

// createTableVendas();

async function createTableVendasPeriodo() {
  try {
    await pool.query("DROP TABLE IF EXISTS vendasPeriodo");
    await pool.query("CREATE TABLE vendasPeriodo ( CANAL TEXT, NUMEROPED INT, CLIENTE TEXT, DATA date, QTDEProdutos INT, FRETE numeric(15,2), TOTALBRUTO numeric(15,2), DESCONTO numeric(15,2), TOTALLIQUIDO numeric(15,2), VENDEDOR TEXT, CONSTRAINT unique_idx_vendasPeriodo UNIQUE (numeroped, data, qtdeprodutos, totalliquido, vendedor) )", (err, res) => {
      //  await pool.query("CREATE TABLE pagas (ID serial PRIMARY KEY UNIQUE, CONTA VARCHAR(255), DESCRICAO VARCHAR(255), FORNECEDOR VARCHAR(255), VENCIMENTO date, DATAPAGAMENTO date, TOTAL numeric(15,2), PAGO numeric(15,2), SALDO numeric(15,2))", (err, res) => {
      console.log("Table created Succesfully");

      pool.end();
    });
  } catch (error) {
    console.error(error.message);
  }
}

// createTableVendasPeriodo();

async function createTableEstoque() {
  try {
    await pool.query("DROP TABLE IF EXISTS estoque");
    await pool.query("CREATE TABLE estoque ( DATE date, PRODUTO TEXT, CODBARRAS NUMERIC, CUSTOUNITARIO numeric(15,2), CUSTOTOTAL numeric(15,2), VENDAUNITARIO numeric(15,2), VendaTotal numeric(15,2), QTDE INT, CONSTRAINT unique_stock_date UNIQUE (DATE, PRODUTO, CODBARRAS) )", (err, res) => {
      //  await pool.query("CREATE TABLE pagas (ID serial PRIMARY KEY UNIQUE, CONTA VARCHAR(255), DESCRICAO VARCHAR(255), FORNECEDOR VARCHAR(255), VENCIMENTO date, DATAPAGAMENTO date, TOTAL numeric(15,2), PAGO numeric(15,2), SALDO numeric(15,2))", (err, res) => {
      // console.log(err, res);
      console.log("Table created Succesfully");

      pool.end();
    });
  } catch (error) {
    console.error(error.message);
  }
}

// createTableEstoque();

async function createTablePagas() {
  try {
    await pool.query("DROP TABLE IF EXISTS pagas");
    await pool.query("CREATE TABLE pagas ( CONTA TEXT, DESCRICAO TEXT, FORNECEDOR TEXT, VENCIMENTO date, DATAPAGAMENTO date, TOTAL numeric(15,2), PAGO numeric(15,2), SALDO numeric(15,2), CONSTRAINT unique_idx_pagas UNIQUE (conta, descricao, vencimento, total, pago) )", (err, res) => {
      //  await pool.query("CREATE TABLE pagas (ID serial PRIMARY KEY UNIQUE, CONTA VARCHAR(255), DESCRICAO VARCHAR(255), FORNECEDOR VARCHAR(255), VENCIMENTO date, DATAPAGAMENTO date, TOTAL numeric(15,2), PAGO numeric(15,2), SALDO numeric(15,2))", (err, res) => {
      console.log("Table created Succesfully");

      pool.end();
    });
  } catch (error) {
    console.error(error.message);
  }
}

// createTablePagas();

async function createTableAPagar() {
  try {
    await pool.query("DROP TABLE IF EXISTS apagar");
    await pool.query("CREATE TABLE apagar ( DATA date, CONTA TEXT, DESCRICAO TEXT, FORNECEDOR TEXT, VENCIMENTO date, TOTAL numeric(15,2), PAGO numeric(15,2), SALDO numeric(15,2), CONSTRAINT unique_idx_apagar UNIQUE (data, conta, descricao, vencimento, total, pago) )", (err, res) => {
      //  await pool.query("CREATE TABLE pagas (ID serial PRIMARY KEY UNIQUE, CONTA VARCHAR(255), DESCRICAO VARCHAR(255), FORNECEDOR VARCHAR(255), VENCIMENTO date, DATAPAGAMENTO date, TOTAL numeric(15,2), PAGO numeric(15,2), SALDO numeric(15,2))", (err, res) => {
      console.log("Table created Succesfully");

      pool.end();
    });
  } catch (error) {
    console.error(error.message);
  }
}

// createTableAPagar();

async function createTableBalanco() {
  try {
    await pool.query("DROP TABLE IF EXISTS balanco");
    await pool.query("CREATE TABLE balanco ( id SERIAL PRIMARY KEY, TIPO text, CONTA text, Total numeric(15,2), DATA date, CONSTRAINT unique_idx_balanco UNIQUE(DATA, TIPO, CONTA))", (err, res) => {
      console.log("Table Balanco created Succesfully");
      pool.end;
    });
  } catch (error) {
    console.error(error.message);
  }
}

createTableBalanco();
