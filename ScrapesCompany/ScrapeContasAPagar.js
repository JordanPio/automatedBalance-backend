// const puppeteer = require("puppeteer");
// const table = require("table").table;
const writeFileSync = require("fs").writeFileSync;
const manipulate = require("../manipulate");
const dtConvert = require("date-fns");
// const dotenv = require("dotenv");
// dotenv.config();

// DATA RANGE

// const startDate = "26/08/2020";
// const endDate = "01/01/2024";
//

exports.scrape = async (browser, errCounter) => {
  // const websiteUrl = "https://kanguruinfo.marketup.com/index.html#/login";
  // const browser = await puppeteer.launch({ headless: true });
  // const page = await browser.newPage();

  // SET DATE RANGES
  let futureDate = new Date();
  // Add 4 years
  futureDate.setDate(futureDate.getDate() + 365 * 4);
  // change format
  futureDate = dtConvert.format(futureDate, "dd/MM/yyyy");

  let currentDate = dtConvert.format(new Date(), "dd/MM/yyyy");

  // const usuario = process.env.USUARIO;
  // const senha = process.env.SENHA;

  let instance = await browser;
  const page = await instance.newPage();
  await page.setViewport({ width: 2400, height: 1171 });

  try {
    // prevent detection as robot
    // page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.0 Safari/537.36");

    // await page.goto(websiteUrl, { waitUntil: "networkidle0" });

    // //set the browser to be in desktop size and do not hide the login menu
    // await page.setViewport({ width: 2400, height: 1171 });

    // await page.waitForSelector("#login§ds_login");

    // //Type login details using fields IDS
    // await page.type("#login§ds_login", usuario, { delay: 100 });
    // await page.type("#login§ds_password", senha, { delay: 100 });

    // await Promise.all([page.waitForNavigation(), page.click("#login§bt_login")]);
    // // await page.waitForNavigation();

    // page.on("dialog", async dialog => {
    //   console.log(dialog.message());
    //   await dialog.dismiss();
    //   await browser.close();
    // });

    await page.goto("https://kanguruinfo.marketup.com/index.html#/report_financial_payable", { waitUntil: "networkidle0" });

    // Click on Button that says Paid Bills - Not required now
    // await page.waitForSelector(".filter > .filters-container > .alternate-buttons > .buttons-center > .btn:nth-child(2)");
    // await page.$eval(".filter > .filters-container > .alternate-buttons > .buttons-center > .btn:nth-child(2)", elem => elem.click());

    // select Date Range and click on filter button

    await page.waitForSelector("body > div.new-content.ng-scope > div > section > div > div > ng-include > div.top-action-bar.report-bar.ng-scope > div > div.right > div > div.filters-container.flex > div > div.from > input");
    await page.type("body > div.new-content.ng-scope > div > section > div > div > ng-include > div.top-action-bar.report-bar.ng-scope > div > div.right > div > div.filters-container.flex > div > div.from > input", currentDate, { delay: 100 });

    await page.waitForSelector("body > div.new-content.ng-scope > div > section > div > div > ng-include > div.top-action-bar.report-bar.ng-scope > div > div.right > div > div.filters-container.flex > div > div.to > input");
    await page.type("body > div.new-content.ng-scope > div > section > div > div > ng-include > div.top-action-bar.report-bar.ng-scope > div > div.right > div > div.filters-container.flex > div > div.to > input", futureDate, { delay: 100 });
    //repeat typying starting date to prevent issue
    await page.type("body > div.new-content.ng-scope > div > section > div > div > ng-include > div.top-action-bar.report-bar.ng-scope > div > div.right > div > div.filters-container.flex > div > div.from > input", currentDate, { delay: 100 });

    await page.$eval("body > div.new-content.ng-scope > div > section > div > div > ng-include > div.top-action-bar.report-bar.ng-scope > div > div.right > div > div.filters-container.flex > div > div.confirm-filter > button", elem => elem.click());

    await page.waitForSelector("td");

    // ACTIVATING AUTOSCROLL
    await autoScroll(page);

    const data1 = await page.evaluate(() => Array.from(document.querySelectorAll("table.table-report tr"), row => Array.from(row.querySelectorAll("th, td"), cell => cell.innerText)));
    const columns = await page.evaluate(() => Array.from(document.querySelectorAll("table.table-report tr"), row => Array.from(row.querySelectorAll("th"), cell => cell.innerText)));
    const linhas = await page.evaluate(() => Array.from(document.querySelectorAll("table.table-report tr"), row => Array.from(row.querySelectorAll("td"), cell => cell.innerText)));

    // console.table(data1); //

    // CONVERT TO TABLE AND CHECK THE WHOLE THING
    // let dataTable = table(data1);
    // console.log(dataTable);

    // writeFileSync(__dirname + "/../data/aPagar.json", JSON.stringify(data1));
    // writeFileSync(__dirname + "/../data/colunasAPagar.json", JSON.stringify(columns));
    // writeFileSync(__dirname + "/../data/linhasAPagar.json", JSON.stringify(linhas));
    // const rowsData = JSON.stringify(linhas);
    // Check if scrape succeded by using EXIBINDO - FIX THIS PART

    const rowsData = manipulate.formatAPagar(linhas);

    validation = 0;
    for (let i = 0; i < rowsData.length; i++) {
      if (!rowsData[i][0].match(/exibindo/i)) {
        continue;
      } else {
        validation = 1;
      }

      if (validation === 1) {
        manipulate.insertAPagar(rowsData);
      } else {
        console.log("Scrape falhou em puxar os dados");
      }
    }
  } catch (e) {
    console.log("error", e.message);
    await page.close(); // if running this script alone change to browser.close
    await console.log("Scrape Contas a Pagar failed, are trying again, please wait....", errCounter);
    if (errCounter > 0) {
      await exports.scrape(browser, errCounter - 1); // browser or page here depending on circunstance
    } else {
      console.log("Application tried to scrape Contas a Pagar more than 3 times and failed");
    }
  }

  // await browser.close();
  await page.close();
};

// scrape();

// AUTO SCROLL END OF PAGE
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var totalHeight = 0;
      var distance = 100;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}
