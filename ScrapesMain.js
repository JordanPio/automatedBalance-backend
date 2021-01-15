const puppeteer = require("puppeteer");
const dotenv = require("dotenv");
const { default: PQueue } = require("p-queue");
dotenv.config();

// const scrape = import("./ScrapesCompany/ScrapeContasAPagar")
const ContasReceber = require("./ScrapesCompany/ScrapeContasReceber");
const ContasAPagar = require("./ScrapesCompany/ScrapeContasAPagar");
const ContasPagas = require("./ScrapesCompany/ScrapeContasPagas");
const estoque = require("./ScrapesCompany/scrapeEstoque");
const vendasPeriodo = require("./ScrapesCompany/ScrapeVendasPeriodo");
const vendasTotais = require("./ScrapesCompany/ScrapeVendasTotais");
// const dtConvert = require("date-fns");
// const { formatVendasPeriodo } = require("./manipulate");

// // // Balance analysis Dates, just use for manual scrapping
// const initialDate = "10/01/2019";
// const finalDate = "16/09/2019";
// let attemptTimes = 2;

// ContasReceber.scrape(attemptTimes);
// ContasAPagar.scrape(attemptTimes);
// ContasPagas.scrape(startDate, endDate, attemptTimes);
// estoque.scrape(attemptTimes);
// vendasPeriodo.scrape(startDate, endDate, attemptTimes); // to aqui, scraped ate 2017
// vendasTotais.scrape(startDate, endDate, attemptTimes); // somente aqeuele periodo que vendeu

// if error try to pull again

// const max_tries = 3

exports.scrapeData = async (errCounter, startDate, endDate) => {
  // old test - remove later
  // await vendasPeriodo.scrape(startDate, endDate, attemptTimes);
  // await vendasTotais.scrape(startDate, endDate, attemptTimes);
  // await console.log("this run after after code completed or failed ?");

  //start from here
  const queue = new PQueue({ concurrency: 6 });
  const browser = puppeteer.launch({ headless: true });
  let instance = await browser;
  const page = await instance.newPage();

  try {
    const usuario = process.env.USUARIO;
    const senha = process.env.SENHA;
    const websiteUrl = "https://kanguruinfo.marketup.com/index.html#/login";

    // prevent detection as robot
    console.log("Starting Scrapping....");
    page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.0 Safari/537.36");

    await page.goto(websiteUrl, { waitUntil: "networkidle0" });

    //set the browser to be in desktop size and do not hide the login menu
    await page.setViewport({ width: 2400, height: 1171 });

    await page.waitForSelector("#login§ds_login");

    //Type login details using fields IDS
    await page.type("#login§ds_login", usuario, { delay: 100 });
    await page.type("#login§ds_password", senha, { delay: 100 });

    await Promise.all([page.waitForNavigation(), page.click("#login§bt_login")]);

    page.on("dialog", async dialog => {
      console.log(dialog.message());
      await dialog.dismiss();
    });
    // working well
    await Promise.all([queue.add(() => estoque.scrape(browser, errCounter)), queue.add(() => ContasReceber.scrape(browser, errCounter)), queue.add(() => ContasAPagar.scrape(browser, errCounter)), queue.add(() => ContasPagas.scrape(browser, startDate, endDate, errCounter)), queue.add(() => vendasPeriodo.scrape(browser, startDate, endDate, errCounter)), queue.add(() => vendasTotais.scrape(browser, startDate, endDate, errCounter))]);
    // await Promise.all([queue.add(() => vendasPeriodo.scrape(browser, startDate, endDate, errCounter))]); // somente vendas Periodo
    // await Promise.all([queue.add(() => vendasTotais.scrape(browser, startDate, endDate, errCounter))]); // somente vendas totais

    // // Old Style working one by one (remember to change the code on each script to accept page instead of browser)
    // // (you need to pass browser and create an instance on each working function when running multiple pages)
    // await estoque.scrape(page, errCounter);
    // await ContasReceber.scrape(page, errCounter);
    // await ContasAPagar.scrape(page, errCounter);
    // await ContasPagas.scrape(page, startDate, endDate, errCounter);

    // await vendasPeriodo.scrape(page, startDate, endDate, errCounter);
    // await vendasTotais.scrape(page, startDate, endDate, errCounter);
  } catch (e) {
    console.log("error", e.message);
    await instance.close();
    await console.log("Error with main Login, we are trying again, please wait....", errCounter);
    if (errCounter > 0) {
      await exports.scrapeData(errCounter - 1, startDate, endDate); // repeat operation if all fail
    } else {
      console.log("Application tried the main Scrape more than 3 times and failed");
    }
  }

  await instance.close(); // close instance (not browser anymore)
  await console.log("ALL SCRAPES DONE");
};

// exports.scrapeData(attemptTimes, initialDate, finalDate);
