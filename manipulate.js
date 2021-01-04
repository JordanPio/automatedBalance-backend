let col = require("./data/colunas.json");
let linhas = require("./data/linhas.json");
let data = require("./data/pagas.json");
const table = require("table").table;

// console.log(col);

// console.log(linhas[1][1]);

//TEST GETTING RID OF EXIBINDO AND ACCENT
// copy = [];
// for (let i = 1; i < data.length; i++) {
//   if (data[i][0].match(/exibindo/i)) {
//     // console.log("CAGOU");
//     continue; // this will just skip that fuck
//   } else {
//     // console.log(data[i]); // check what is printing
//     // Normalize the data inside array = Subarray in this case - MAP Necessary
//     normalize = data[i].map(s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
//     copy.push(normalize);

//     // PRINT AND Remove accents/diacritics in a string in JavaScript
//     // console.log(data[i][0].normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
//   }
//   if (i == 5) {
//     // console.log(copy);
//     break;
//   }
// }
// copy = table(copy);
// console.log("first print", copy);
// console.log(data[0]);

const pool = require("./db");

// // ### CONVERT INTEGER TO NUMBERS AND REMOVE ACCENTS ALL TOGETHER

exports.formatPagas = function (dataSet) {
  cleanedData = [];

  for (let i = 1; i < dataSet.length; i++) {
    normalize = dataSet[i].map((value, index, everything) => (index == 5 || (index == 6) | (index == 7) ? parseFloat(value.slice(3).replace(".", "").replace(",", ".")) : value));
    // normalize = linhas[i].map((value, index, everything) => (index == 5 || (index == 6) | (index == 7) ? parseFloat(value.slice(3).replace(".", "").replace(",", ".")) : value.normalize("NFD").replace(/[\u0300-\u036f]/g, "")));
    cleanedData.push(normalize);
    // if (i == 6000) {
    //   console.log("Exceeded over 6000 rows limit in formatNumbersToInt - Please adjust your function");
    //   // break;
    //   return cleanedData;
    // }
  }
  return cleanedData;
};

exports.formatAPagar = function (dataSet) {
  cleanedData = [];

  for (let i = 1; i < dataSet.length; i++) {
    normalize = dataSet[i].map((value, index, everything) => (index == 4 || (index == 5) | (index == 6) ? parseFloat(value.slice(3).replace(".", "").replace(",", ".")) : value));
    // normalize = linhas[i].map((value, index, everything) => (index == 5 || (index == 6) | (index == 7) ? parseFloat(value.slice(3).replace(".", "").replace(",", ".")) : value.normalize("NFD").replace(/[\u0300-\u036f]/g, "")));
    cleanedData.push(normalize);
    // if (i == 6000) {
    //   console.log("Exceeded over 6000 rows limit in formatNumbersToInt - Please adjust your function");
    //   // break;
    //   return cleanedData;
    // }
  }
  return cleanedData;
};

// //TEST
// const apagar = require("./data/linhasAPagar.json");
// const apagarFormatado = formatAPagar(apagar);
// console.log(apagarFormatado);

exports.formatVendasTotais = function (dataSet) {
  cleanedData = [];

  for (let i = 1; i < dataSet.length; i++) {
    normalize = dataSet[i].map((value, index, everything) => (index == 4 || (index == 5) | (index == 6) | (index == 7) | (index == 8) ? parseFloat(value.slice(3).replace(".", "").replace(",", ".")) : index == 3 || index == 9 ? parseFloat(value.replace(".", "").replace(",", ".")) : value));
    // normalize = linhas[i].map((value, index, everything) => (index == 5 || (index == 6) | (index == 7) ? parseFloat(value.slice(3).replace(".", "").replace(",", ".")) : value.normalize("NFD").replace(/[\u0300-\u036f]/g, "")));
    cleanedData.push(normalize);
    // if (i == 6000) {
    //   console.log("Exceeded over 6000 rows limit in formatNumbersToInt - Please adjust your function");
    //   // break;
    //   return cleanedData;
    // }
  }
  return cleanedData;
};

// //TEST
// const vendas = require("./data/Vendaslinhas.json");
// const vendasFormatado = formatVendasTotais(vendas);
// console.log(vendasFormatado);

exports.formatVendasPeriodo = function (dataSet) {
  cleanedData = [];

  for (let i = 1; i < dataSet.length; i++) {
    normalize = dataSet[i].map((value, index, everything) => (index == 6 || (index == 7) | (index == 8) | (index == 9) ? parseFloat(value.slice(3).replace(".", "").replace(",", ".")) : index == 1 ? parseFloat(value.replace(".", "").replace(",", ".")) : value));
    // normalize = linhas[i].map((value, index, everything) => (index == 5 || (index == 6) | (index == 7) ? parseFloat(value.slice(3).replace(".", "").replace(",", ".")) : value.normalize("NFD").replace(/[\u0300-\u036f]/g, "")));
    cleanedData.push(normalize);
    // if (i == 6000) {
    //   console.log("Exceeded over 6000 rows limit in formatNumbersToInt - Please adjust your function");
    //   // break;
    //   return cleanedData;
    // }
  }
  return cleanedData;
};

//TEST
// const vendas = require("./data/VendasPeriodoLinhas.json");
// const vendasFormatado = formatVendasPeriodo(vendas);
// console.log(vendasFormatado);

exports.formatReceber = function (dataSet) {
  cleanedData = [];

  for (let i = 1; i < dataSet.length; i++) {
    normalize = dataSet[i].map((value, index, everything) => (index == 4 || (index == 5) | (index == 6) ? parseFloat(value.slice(3).replace(".", "").replace(",", ".")) : value));
    // normalize = linhas[i].map((value, index, everything) => (index == 5 || (index == 6) | (index == 7) ? parseFloat(value.slice(3).replace(".", "").replace(",", ".")) : value.normalize("NFD").replace(/[\u0300-\u036f]/g, "")));
    cleanedData.push(normalize);
    // if (i == 6000) {
    //   console.log("Exceeded over 6000 rows limit in formatNumbersToInt - Please adjust your function");
    //   // break;
    //   return cleanedData;
    // }
  }
  return cleanedData;
};
// //TEST
// const aReceberData = require("./data/linhasReceber.json");
// const aReceber = formatReceber(aReceberData);
// // console.log(aReceber);

exports.formatEstoque = function (dataSet) {
  cleanedData = [];

  for (let i = 1; i < dataSet.length; i++) {
    normalize = dataSet[i].map((value, index, everything) => (index == 2 || (index == 3) | (index == 4) | (index == 5) ? parseFloat(value.slice(3).replace(".", "").replace(",", ".")) : index == 1 || index == 6 ? parseFloat(value.replace(".", "").replace(",", ".")) : value));
    // normalize = dataSet[i].map((value, index, everything) => (index == 2 || (index == 3) | (index == 4) | (index == 5) ? parseFloat(value.slice(3).replace(".", "").replace(",", ".")) : value));
    // normalize = linhas[i].map((value, index, everything) => (index == 5 || (index == 6) | (index == 7) ? parseFloat(value.slice(3).replace(".", "").replace(",", ".")) : value.normalize("NFD").replace(/[\u0300-\u036f]/g, "")));
    cleanedData.push(normalize);
    // if (i == 6000) {
    //   console.log("Exceeded over 6000 rows limit in formatEstoque - Please adjust your function");
    //   // break;
    //   return cleanedData;
    // }
  }
  return cleanedData;
};

// TO TEST
// const estoque = require("./data/linhasEstoque.json");
// estoque1 = formatEstoque(estoque);

// ACTIVATE THIS BY UNCOMMENT THE LINE BELOW
// cleanedData = formatNumbersToInt(linhas);

// Previous Tests on how I came up with SOLUTION
// test = parseFloat(linhas[i][5].slice(3).replace('.','').replace(',','.'))
// test = test.replace('.','').replace(',','.')
// test = parseFloat(test)
// test = linhas[i][5].replace(',','.').replace(' ','')

// console.log(test);
// normalize = linhas[i].map(s => s.slice(3).replace(".", "").replace(",", "."));

// #### Insert into database

exports.insertPagas = async dataSet => {
  insertionsCounted = 0;
  repeatedInsertionsRejected = 0;
  let myInsert = "INSERT INTO pagas (CONTA, DESCRICAO, FORNECEDOR, VENCIMENTO, DATAPAGAMENTO, TOTAL, PAGO, SALDO) VALUES($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT ON CONSTRAINT unique_idx_pagas DO NOTHING RETURNING * ";

  try {
    for (let i = 0; i < dataSet.length; i++) {
      if (dataSet[i][0].match(/exibindo/i)) {
        continue;
        // } else if (i == 1000) {
        //   break;
      } else {
        const insertInto = await pool.query(myInsert, [dataSet[i][0], dataSet[i][1], dataSet[i][2], dataSet[i][3], dataSet[i][4], dataSet[i][5], dataSet[i][6], dataSet[i][7]]);
        insertionsCounted = insertionsCounted + insertInto.rowCount;
        if (insertInto.rowCount == 0) {
          repeatedInsertionsRejected = repeatedInsertionsRejected + 1;
        }
        // console.log(repeatedInsertionsRejected);
      }
    }
    console.log("Scrape Contas Pagas was Succesful Total New Rows Added: ", insertionsCounted, "Detected repeated row: ", repeatedInsertionsRejected);
  } catch (error) {
    console.log(error.message);
  }
};

exports.insertAPagar = async dataSet => {
  insertionsCounted = 0;
  repeatedInsertionsRejected = 0;
  const datetime = new Date();

  let myInsert = "INSERT INTO apagar (DATA, CONTA, DESCRICAO, FORNECEDOR, VENCIMENTO, TOTAL, PAGO, SALDO ) VALUES($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT ON CONSTRAINT unique_idx_apagar DO NOTHING RETURNING * ";

  try {
    for (let i = 0; i < dataSet.length; i++) {
      if (dataSet[i][0].match(/exibindo/i)) {
        continue;
        // } else if (i == 1000) {
        //   break;
      } else {
        const insertInto = await pool.query(myInsert, [datetime, dataSet[i][0], dataSet[i][1], dataSet[i][2], dataSet[i][3], dataSet[i][4], dataSet[i][5], dataSet[i][6]]);
        insertionsCounted = insertionsCounted + insertInto.rowCount;
        if (insertInto.rowCount == 0) {
          repeatedInsertionsRejected = repeatedInsertionsRejected + 1;
        }
        // console.log(repeatedInsertionsRejected);
      }
    }
    console.log("Scrape Contas a Pagar was Succesful Total New Rows Added: ", insertionsCounted, "Detected repeated row: ", repeatedInsertionsRejected);
  } catch (error) {
    console.log(error.message);
  }
};

// insertAPagar(apagarFormatado);

exports.insertReceber = async dataSet => {
  insertionsCounted = 0;
  repeatedInsertionsRejected = 0;
  let myInsert = "INSERT INTO receber (DATA, CONTA, DESCRICAO, CLIENTE, VENCIMENTO, TOTAL, RECEBIDO, SALDO) VALUES($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT ON CONSTRAINT unique_idx_receber DO NOTHING RETURNING * ";
  const datetime = new Date();

  try {
    for (let i = 0; i < dataSet.length; i++) {
      if (dataSet[i][0].match(/exibindo/i)) {
        continue;
        // } else if (i == 1000) {
        //   break;
      } else {
        const insertInto = await pool.query(myInsert, [datetime, dataSet[i][0], dataSet[i][1], dataSet[i][2], dataSet[i][3], dataSet[i][4], dataSet[i][5], dataSet[i][6]]);
        insertionsCounted = insertionsCounted + insertInto.rowCount;
        if (insertInto.rowCount == 0) {
          repeatedInsertionsRejected = repeatedInsertionsRejected + 1;
        }
        // console.log(repeatedInsertionsRejected);
      }
    }
    console.log("Scrape Contas a Receber was Succesful Total New Rows Added: ", insertionsCounted, "Detected repeated row: ", repeatedInsertionsRejected);
  } catch (error) {
    console.log(error.message);
  }
};

// insertReceber(aReceber);

exports.insertEstoqueData = async dataSet => {
  insertionsCounted = 0;
  repeatedInsertionsRejected = 0;
  const datetime = new Date();
  let myInsert = "INSERT INTO estoque (DATE, PRODUTO, CODBARRAS, CUSTOUNITARIO, CUSTOTOTAL, VENDAUNITARIO, VENDATOTAL, QTDE) VALUES($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT ON CONSTRAINT unique_stock_date DO NOTHING RETURNING * ";

  try {
    for (let i = 0; i < dataSet.length; i++) {
      if (dataSet[i][0].match(/exibindo/i)) {
        continue;
        // } else if (i == 1000) {
        //   break;
      } else {
        const insertInto = await pool.query(myInsert, [datetime, dataSet[i][0], dataSet[i][1], dataSet[i][2], dataSet[i][3], dataSet[i][4], dataSet[i][5], dataSet[i][6]]);
        insertionsCounted = insertionsCounted + insertInto.rowCount;
        if (insertInto.rowCount == 0) {
          repeatedInsertionsRejected = repeatedInsertionsRejected + 1;
        }
        // console.log(repeatedInsertionsRejected);
      }
    }
    console.log("Scrape Estoque was Succesful Total New Rows Added: ", insertionsCounted, "Detected repeated row: ", repeatedInsertionsRejected);
  } catch (error) {
    console.log(error.message);
  }
};

exports.insertVendasTotais = async (dataSet, startDate, endDate) => {
  insertionsCounted = 0;
  repeatedInsertionsRejected = 0;
  let myInsert = "INSERT INTO vendasTotais (DE, ATE, PRODUTO, QTDE, PRECOVENDA, CUSTO, CUSTOTOTAL, PORCENTAGEMLUCRO, LUCRO, TOTALVENDAS) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT ON CONSTRAINT unique_idx_vendas DO NOTHING RETURNING * ";

  try {
    for (let i = 0; i < dataSet.length; i++) {
      if (dataSet[i][0].match(/exibindo/i)) {
        continue;
        // } else if (i == 1000) {
        //   break;
      } else {
        const insertInto = await pool.query(myInsert, [startDate, endDate, dataSet[i][2], dataSet[i][3], dataSet[i][4], dataSet[i][6], dataSet[i][7], dataSet[i][9], dataSet[i][8], dataSet[i][5]]);
        insertionsCounted = insertionsCounted + insertInto.rowCount;
        if (insertInto.rowCount == 0) {
          repeatedInsertionsRejected = repeatedInsertionsRejected + 1;
        }
        // console.log(repeatedInsertionsRejected);
      }
    }
    console.log("Scrape Vendas Totais was Succesful Total New Rows Added: ", insertionsCounted, "Detected repeated row: ", repeatedInsertionsRejected);
  } catch (error) {
    console.log(error.message);
  }
};

exports.insertVendasPeriodo = async dataSet => {
  insertionsCounted = 0;
  repeatedInsertionsRejected = 0;
  let myInsert = "INSERT INTO vendasPeriodo (CANAL, NUMEROPED, CLIENTE, DATA, QTDEProdutos, FRETE, TOTALBRUTO, DESCONTO, TOTALLIQUIDO, VENDEDOR) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT ON CONSTRAINT unique_idx_vendasPeriodo DO NOTHING RETURNING * ";

  try {
    for (let i = 0; i < dataSet.length; i++) {
      if (dataSet[i][0].match(/exibindo/i)) {
        continue;
        // } else if (i == 1000) {
        //   break;
      } else {
        const insertInto = await pool.query(myInsert, [dataSet[i][0], dataSet[i][1], dataSet[i][2], dataSet[i][4], dataSet[i][5], dataSet[i][6], dataSet[i][7], dataSet[i][8], dataSet[i][9], dataSet[i][3]]);
        insertionsCounted = insertionsCounted + insertInto.rowCount;
        if (insertInto.rowCount == 0) {
          repeatedInsertionsRejected = repeatedInsertionsRejected + 1;
        }
        // console.log(repeatedInsertionsRejected);
      }
    }
    console.log("Scrape Vendas por Periodo was Succesful Total New Rows Added: ", insertionsCounted, "Detected repeated row: ", repeatedInsertionsRejected);
  } catch (error) {
    console.log(error.message);
  }
};

// const startDate = "01/01/2020";
// const endDate = "01/05/2020";
// insertVendasPeriodo(vendasFormatado);

// insertEstoqueData(estoque1);

// TO ACTIVATE THIS
// insertData(cleanedData);

// // TEST TO CHECK IF IT DOES RETRIEVE VALUES WITH Accents

// let retrieveData = async (err, result) => {
//   try {
//     const retrieve = await pool.query("SELECT * FROM pagas");
//     console.log(retrieve);
//   } catch (error) {
//     console.error(error.message);
//   }
// };
// retrieveData();
