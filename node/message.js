const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
require("dotenv").config();

const SLACK_API_TOKEN = process.env.SLACK_API_TOKEN;
const SLACK_CHANNEL_ID = process.env.SLACK_CHANNEL_ID;

const testResult = "failed";
const colorCode = testResult === "success" ? "#00FF00" : "#FF0000";
const text = `
*TASK*: B2BMNO PROD CALCULATION\n
*DETAIL*: EXISTING APPLICATION[https://business-portal.mobile.rakuten.co.jp]\n
*RESULT*: ${testResult === "success" ? "Test Passed" : "Test Failed"}\n
`;

const sendMessageToSlack = async (filePath) => {
  try {
    const attachments = [
      {
        color: colorCode,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: text,
            },
          },
        ],
      },
    ];
    const response = await axios.post(
      "https://slack.com/api/chat.postMessage",
      {
        channel: SLACK_CHANNEL_ID,
        attachments: attachments,
      },
      {
        headers: {
          Authorization: `Bearer ${SLACK_API_TOKEN}`,
        },
      }
    );

    if (response.data && response.data.ok) {
      console.log("Slackにメッセージを送信しました！");
      uploadFileAndSendMessage();
    } else {
      console.error("Slackメッセージ送信エラー:", response.data);
    }
  } catch (error) {
    console.error("Slack APIリクエストエラー:", error);
  }
};

const uploadFileAndSendMessage = async () => {
  const zipFilePath = "cypress/videos.zip";
  const formData = new FormData();
  formData.append("channels", SLACK_CHANNEL_ID);
  formData.append("file", fs.createReadStream(zipFilePath), {
    contentType: "application/zip",
  });
  formData.append("initial_comment", "Cypress Report");

  try {
    const response = await axios.post(
      "https://slack.com/api/files.upload",
      formData,
      {
        headers: {
          Authorization: `Bearer ${SLACK_API_TOKEN}`,
          ...formData.getHeaders(),
        },
      }
    );

    if (response.data.ok) {
      console.log("ファイルをアップロードしてメッセージに添付しました。");
    } else {
      console.log(response);
      console.log("ファイルのアップロードに失敗しました。");
    }
  } catch (error) {
    console.error("エラー:", error.message);
  }
};

module.exports = sendMessageToSlack;
