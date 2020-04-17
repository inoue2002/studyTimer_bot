"use strict";
const line = require("@line/bot-sdk");
const client = new line.Client({ channelAccessToken: process.env.ACCESSTOKEN });
exports.handler = (event, context) => {

  let body = JSON.parse(event.body);
  const events = body.events;
  console.log(events);

    events.forEach(async (event) => {
      let mes;
      switch (event.type) {
        case "message": 
          mes = await messageFunc(event);
          break;
       /* case "postback": 
          mes = await postbackFunc(event);
          break;*/
        case "follow": 
          const pro = await client.getProfile(event.source.userId);
          mes = {
            type: "text",
            text: `${pro.displayName}さん追加ありがとう！`,
          };
          break;
      }

      //メッセージを返信
      if (mes != undefined) {
        client
          .replyMessage(body.events[0].replyToken, mes)
          .then((response) => {
            let lambdaResponse = {
              statusCode: 200,
              headers: { "X-Line-Status": "OK" },
              body: '{"result":"completed"}',
            };
            context.succeed(lambdaResponse);
          })
          .catch((err) => console.log(err));
        return;
      }
    });
  }


const messageFunc = async function (e) {
  let mes;
  switch (e.message.type) {
    case "text": 
      mes = await textFunc(e);
      break;
      /*case "postback":
        mes = await postbackFunc(e)
        breake;  */
    default:
      mes = { type: "text", text: "読み込めませんでした" };
  }
  return mes;
};

async function textFunc(e) {
  let userMes = e.message.text;
  let returnMes;
  returnMes = { type: "text", text: `受け取ったメッセージ：${userMes}` };
  //特定のキーワードに応答
  /*
  if(userMes === "ほげほげ"){
    returnMes = {type:"text",text:"お返事"}
  }
   */
  return returnMes;
}

