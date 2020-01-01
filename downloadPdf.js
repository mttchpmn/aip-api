const Axios = require("axios");
const fs = require("fs");
const util = require("util");
const http = require("http");

const writeFile = util.promisify(fs.writeFile);

module.exports = async (url, path) => {
  const fName = url.split("/").pop();

  const writer = fs.createWriteStream(`${path}/${fName}`);
  writer.on("open", () => console.log("Writing PDF to file."));
  writer.on("close", () => console.log("File created successfully."));

  console.log(`Retrieving PDF from: ${url}`);
  http.get(url, res => res.pipe(writer));
  // const response = await Axios.get(url, { responseType: "stream" });
  // await response.data.pipe(writer);

  // const response = await Axios.get(url, { responseType: "arrayBuffer" });
  // await writeFile(`${path}/${fName}`, response.data);
};
