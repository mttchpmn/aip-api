const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const moment = require("moment");
const ProgressBar = require("progress");

const getIndexHtml = async url => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto("http://www.aip.net.nz");
  await page.click("#btnAgree");
  await page.goto(url, {
    waitUntil: "networkidle2"
  });
  const html = await page.content();
  await browser.close();

  return html;
};

const parseIndexPage = async html => {
  const $ = cheerio.load(html);
  const chartUrls = [];
  const indexUrls = [];

  $("a").each(function(i, elem) {
    const link = $(this)
      .attr("href")
      .trim();
    const baseUrl = "http://www.aip.net.nz";

    if (link.startsWith("pdf")) {
      chartUrls.push(`${baseUrl}/${link}`);
    }
    if (link.startsWith("NavWalk")) {
      indexUrls.push(`${baseUrl}/${link}`);
    }
  });

  return [chartUrls, indexUrls];
};

module.exports = async () => {
  console.log("Scraping aerodrome charts...");

  // Create result skeleton
  const result = { charts: {} };
  result.retrievedAt = new moment.utc().format("DD MMM HH:mm:ss");

  // Scrape main page for simple (non-nested) charts and index urls for nested charts
  const [chartUrls, indexUrls] = await parseIndexPage(
    await getIndexHtml("http://www.aip.net.nz/NavWalk.aspx?section=CHARTS")
  );

  // Init progress bar
  const totalNumber = chartUrls.length + indexUrls.length;
  const bar = new ProgressBar(":bar (:current/:total)", {
    total: totalNumber
  });

  // Add simple charts to result object
  chartUrls.forEach(url => {
    const code = url
      .split("/")
      .pop()
      .split(".")
      .shift();
    result.charts[code] = url;
    bar.tick();
  });

  // Iterate through index urls, scrape nested charts from each, add to response object
  for (url of indexUrls) {
    const [charts, urls] = await parseIndexPage(await getIndexHtml(url));
    const code = charts[0]
      .split("/")
      .pop()
      .slice(0, 4);
    result.charts[code] = charts;
    bar.tick();
  }

  return result;
};
