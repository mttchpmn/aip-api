const fs = require("fs");

const buildUrlObject = require("./buildUrlObject");
const downloadPdf = require("./downloadPdf");

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  // const chartObject = await buildUrlObject();
  const testObject = require("./testData");
  const charts = testObject.charts;

  if (!fs.existsSync("./pdf")) fs.mkdirSync("./pdf");

  Object.keys(charts).forEach(async code => {
    await sleep(5000);
    if (!fs.existsSync(`./pdf/${code}`)) fs.mkdirSync(`./pdf/${code}`);

    if (typeof charts[code] === "string") {
      await downloadPdf(charts[code], `./pdf/${code}`);
    }
    // charts[code].forEach(async url => {
    //   console.log("url :", url);
    //   await downloadPdf(url, `./pdf/${code}`);
    // });

    await sleep(2000);
  });
})();
