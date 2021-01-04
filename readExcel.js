const xlsxFile = require("read-excel-file/node");
const pool = require("./db");

// CHECK THE SHEETS NAME
// xlsxFile("D:/Google Drive/Empresa/Automated Every Month/Balanco Patrimonial Socios.xlsx", { getSheets: true }).then(sheets => {
//   sheets.forEach(obj => {
//     console.log(obj.name);
//   });
// });

// Read EXCEL FILE
const scrapeData = async function () {
  dados = []; //initialize a dataset

  await xlsxFile("D:/Google Drive/Empresa/Automated Every Month/Balanco Patrimonial Socios.xlsx", { sheet: "Automation" }).then(rows => {
    console.log(rows);

    for (let i = 0; i < rows.length; i++) {
      for (let j = 0; j < rows[i].length; j++) {
        if (j >= 2 && i > 1 && i <= rows.length) {
          dados.push([rows[i][0], rows[i][1], rows[i][j].toFixed(2), rows[0][j]]);

          //Old way which is unecessary and hardcoded (This was just to FIGURE OUT THE FIELDS)
          // if (j == 2) {
          //   dados.push([rows[i][0], rows[i][1], rows[i][j], rows[0][2]]);
          // } else if (j == 3) {
          //   dados.push([rows[i][0], rows[i][1], rows[i][j], rows[0][3]]);
          // } else if (j == 4) {
          //   dados.push([rows[i][0], rows[i][1], rows[i][j], rows[0][4]]);
          // } else if (j == 5) {
          //   dados.push([rows[i][0], rows[i][1], rows[i][j], rows[0][5]]);
          // } else if (j == 6) {
          //   dados.push([rows[i][0], rows[i][1], rows[i][j], rows[0][6]]);
          // } else if (j == 7) {
          //   dados.push([rows[i][0], rows[i][1], rows[i][j], rows[0][7]]);
          // }
        }

        // console.log("while i = ", i, " and j = ", j, "type =", typeof rows[i][j], " data =", rows[i][j]); // very important to understand the data structure and how to transpose the TABLE
      }
    }

    // console.table(dados); // Vizualize the table here
  });

  // console.table(dados);
  return dados;
};

// INSERTING DATA INTO DB needs to use .then because we are getting results from a Promise
const test = scrapeData();
test.then(function (result) {
  // console.table(result);
  insertBalanco(result);
});

// INSERT DATA INTO DATABASE

const insertBalanco = async dataSet => {
  insertionsCounted = 0;
  repeatedInsertionsRejected = 0;
  let myInsert = "INSERT INTO balanco (TIPO, CONTA, TOTAL, DATA) VALUES($1, $2, $3, $4) ON CONFLICT ON CONSTRAINT unique_idx_balanco DO NOTHING RETURNING * ";

  try {
    for (let i = 0; i < dataSet.length; i++) {
      const insertInto = await pool.query(myInsert, [dataSet[i][0], dataSet[i][1], dataSet[i][2], dataSet[i][3]]);
      insertionsCounted = insertionsCounted + insertInto.rowCount;
      if (insertInto.rowCount == 0) {
        repeatedInsertionsRejected = repeatedInsertionsRejected + 1;
      }
      // console.log(repeatedInsertionsRejected);
    }
    console.log("Total New Rows Added: ", insertionsCounted, "Detected repeated row: ", repeatedInsertionsRejected);
  } catch (error) {
    console.log(error.message);
  }
};

insertBalanco(dados);
