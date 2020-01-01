const downloadPdf = require("./downloadPdf");

(async () => {
  await downloadPdf("http://www.aip.net.nz/pdf/NZAR_35.3_35.4.pdf", "./");
})();
