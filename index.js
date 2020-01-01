const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const moment = require("moment");

const downloadPdf = require("./downloadPdf");

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

(async () => {
  const result = {};
  result.retrievedAt = new moment.utc().format("DD MMM HH:mm:ss");

  const homeIndexHtml = await getIndexHtml(
    "http://www.aip.net.nz/NavWalk.aspx?section=CHARTS"
  );

  const [chartUrls, indexUrls] = await parseIndexPage(homeIndexHtml);

  console.log(
    "###############################################################################################\n\n"
  );
  chartUrls.forEach(url => {
    const code = url
      .split("/")
      .pop()
      .split(".")
      .shift();
    result[code] = url;
  });

  //   indexUrls.forEach(async url => {
  for (url of indexUrls) {
    console.log(`Scraping charts for ${url}`);
    const [charts, urls] = await parseIndexPage(await getIndexHtml(url));
    const code = charts[0]
      .split("/")
      .pop()
      .slice(0, 4);
    result[code] = charts;
  }
  //   });

  console.log("result :", result);
})();
