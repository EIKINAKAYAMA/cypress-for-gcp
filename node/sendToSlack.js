const fs = require("fs");
const archiver = require("archiver");
const sendMessageToSlack = require("./message.js");

const folderPath = "cypress/videos";
const zipFilePath = "cypress/videos.zip";

const createZipFile = () => {
  const output = fs.createWriteStream(zipFilePath);
  const archive = archiver("zip", { zlib: { level: 9 } }); // 圧縮レベルを最大に設定

  output.on("close", () => {
    console.log("Zipファイルが生成されました！");
    sendMessageToSlack(zipFilePath);
  });

  archive.on("error", (err) => {
    console.error("Zipファイルの作成中にエラーが発生しました:", err);
  });

  archive.directory(folderPath, false);
  archive.pipe(output);
  archive.finalize();
};

createZipFile();
