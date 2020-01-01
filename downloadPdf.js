const Axios = require("axios");
const fs = require("fs");

module.exports = async url => {
  const fName = url.split("/").pop();

  const writer = fs.createWriteStream(fName);
  writer.on("open", () => console.log("Writing PDF to file."));
  writer.on("close", () => console.log("File created successfully."));

  console.log(`Retrieving PDF from: ${url}`);
  const response = await Axios.get(url, { responseType: "stream" });
  response.data.pipe(writer);

  return true;
};
