"use strict";
const line = require("@line/bot-sdk")
const client = new line.Client({ channelAccessToken: process.env.ACCESSTOKEN });

exports.handler = (event, context,callback) => {

  let body = JSON.parse(event.body);
  const events = body.events;
  console.log(events);

    events.forEach(async (event) => {
      let mes;
      switch (event.type) {
        case "message": 
          mes = await messageFunc(event);
          break;
       case "postback": 
          mes = await postbackFunc(event);
          break;
        case "follow": 
          const pro = await client.getProfile(event.source.userId);
          mes = {
            type: "text",
            text: `友達登録ありがとう。「勉強開始」って話しかけるか下のメニューからstudyTimerを起動してね`,
          };
          break;
          case"join":
          mes = {type:"text",text:"こんにちは。studyTimerです。友達追加して、「勉強開始」と話かけてもらえるとタイマーを開始します。「バイバイ」と言われると退室します。"}
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
      case "postback":
        mes = await postbackFunc(e)
        break;  
    default:
      mes = { type: "text", text: "読み込めませんでした" };
  }
  return mes;
};

async function textFunc(e) {
  let userMes = e.message.text;
  let returnMes;

  //特定のキーワードに応答
  
  if(userMes === "勉強開始"){
    var start_ms = new Date().getTime();
    start_ms =  Math.floor( start_ms / 1000 ) ;
    var  pro = await client.getProfile(e.source.userId);
    console.log(`start_ms_${start_ms}`)
    console.log(`pro:${pro}`)

    returnMes ={
      "type": "flex",
      "altText": "Flex Message",
      "contents": {
        "type": "bubble",
        "direction": "ltr",
        "header": {
          "type": "box",
          "layout": "vertical",
          "spacing": "md",
          "contents": [
            {
              "type": "text",
              "text": `${pro.displayName}が勉強を開始しました。`,
              "align": "center",
              "wrap": true
            }
          ]
        },
        "footer": {
          "type": "box",
          "layout": "horizontal",
          "spacing": "lg",
          "contents": [
            {
              "type": "button",
              "action": {
                "type": "postback",
                "label": "勉強を終了",
                "data": "e"+"---"+"0"+"---"+start_ms
              },
              "style": "primary"
            },
            {
              "type": "button",
              "action": {
                "type": "postback",
                "label": "休憩",
                "data": "s"+"---"+"0"+"---"+start_ms
              },
              "style":  "primary"
            }
          ]
        }
      }
    }
  }

  if(userMes ==="バイバイ")
  {
    if(e.source.groupId !== undefined){
      client.leaveGroup(e.source.groupId)
    }
    if(e.source.roomId!==undefined){
      client.getRoomMemberIds(e.source.roomId)
    }
  }
  
  if(userMes ==="友達に紹介する")
  {
    returnMes = {
      "type": "flex",
      "altText": "Flex Message",
      "contents": {
        "type": "bubble",
        "direction": "ltr",
        "header": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "text",
              "text": "友達に紹介する",
              "align": "center"
            }
          ]
        },
        "hero": {
          "type": "image",
          "url": "https://qr-official.line.me/sid/L/353wnnzg.png",
          "size": "full",
          "aspectRatio": "1.51:1",
          "aspectMode": "fit"
        },
        "footer": {
          "type": "box",
          "layout": "horizontal",
          "contents": [
            {
              "type": "button",
              "action": {
                "type": "uri",
                "label": "SNSで共有する！",
                "uri": "https://linecorp.com"
              },
              "style": "primary"
            }
          ]
        }
      }
    }
  }
  return returnMes;
}


async function postbackFunc(e) {
  var  pro = await client.getProfile(e.source.userId);
  console.log(pro.displayName)
  var str = e.postback.data;
  var result = str.split("---");
  console.log(result)
  console.log(result[0])  //e s r m 
  console.log(result[1])  //経過時間秒
  console.log(result[2])  //タイムスタンプ
  if(result[0]==="s"){
    var elapsed_ms = new Date().getTime() 
elapsed_ms =Math.floor( elapsed_ms / 1000 ) ;  //今のタイムスタンプ
let processSec = Number(result[1]) +  elapsed_ms - result[2]//経過時間秒を計算
   console.log(processSec)
  let  returnMes ={
      "type": "flex",
      "altText": "Flex Message",
      "contents": {
        "type": "bubble",
        "direction": "ltr",
        "header": {
          "type": "box",
          "layout": "vertical",
          "spacing": "md",
          "contents": [
            {
              "type": "text",
              "text": `${pro.displayName}が休憩開始しました。`,
              "align": "center",
              "wrap": true
            }
          ]
        },
        "footer": {
          "type": "box",
          "layout": "horizontal",
          "spacing": "lg",
          "contents": [
            {
              "type": "button",
              "action": {
                "type": "postback",
                "label": "勉強を再開",
                "data": `r---${processSec}---${elapsed_ms}`
              },
              "style": "primary"
            }
          ]
        }
      }
    }
    return returnMes
  }
  if(result[0]==="r"){
    //  r---総経過時間---タイムスタンプ
    var elapsed_ms = new Date().getTime() 
    elapsed_ms =Math.floor( elapsed_ms / 1000 ) ;  //今のタイムスタンプ
let NUMBER =  Number(result[1])
       console.log(NUMBER)
      let  returnMes ={
        "type": "flex",
        "altText": "Flex Message",
        "contents": {
          "type": "bubble",
          "direction": "ltr",
          "header": {
            "type": "box",
            "layout": "vertical",
            "spacing": "md",
            "contents": [
              {
                "type": "text",
                "text": `${pro.displayName}が勉強を開始しました。`,
                "align": "center",
                "wrap": true
              }
            ]
          },
          "footer": {
            "type": "box",
            "layout": "horizontal",
            "spacing": "lg",
            "contents": [
              {
                "type": "button",
                "action": {
                  "type": "postback",
                  "label": "勉強を終了",
                  "data": `e---${NUMBER}---${elapsed_ms}`
                },
                "style": "primary"
              },
              {
                "type": "button",
                "action": {
                  "type": "postback",
                  "label": "休憩",
                  "data":  `s---${NUMBER}---${elapsed_ms}`
                },
                "style": "primary"
              }
            ]
          }
        }
      }
      return returnMes
     
}



if(result[0]==="e"){
  var elapsed_ms = new Date().getTime() 
  elapsed_ms =Math.floor( elapsed_ms / 1000 ) ;  //今のタイムスタンプ
let NUMBER = elapsed_ms - Number(result[2]) + Number(result[1])
     console.log(NUMBER)

     var hour = Math.floor (NUMBER / 3600)
var hour_wari = Math.floor (NUMBER % 3600)
var min = Math.floor (hour_wari / 60 )
var min_wari = Math.floor(hour_wari % 60)
var sec = min_wari

    let  returnMes ={
      "type": "flex",
      "altText": "Flex Message",
      "contents": {
        "type": "bubble",
        "direction": "ltr",
        "header": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "text",
              "text": `${pro.displayName}が${hour}時間${min}分${sec}秒勉強しました。`,
              "align": "center",
              "wrap": true
            }
          ]
        },
        "footer": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "text",
              "text": "また勉強を始める時は「勉強開始」って呼びかけてね。",
              "wrap": true
            }
          ]
        }
      }
    }
    return returnMes

}







 /* 

var start_ms = Number(e.postback.data)

console.log(`始まりの時間：${start_ms}`)
var elapsed_ms = new Date().getTime() 
elapsed_ms =Math.floor( elapsed_ms / 1000 ) ;
elapsed_ms = elapsed_ms - start_ms;  //秒数
console.log(`経過時間：${elapsed_ms}`)



  returnMes = {
    "type": "flex",
    "altText": "勉強終了！",
    "contents": {
      "type": "bubble",
      "direction": "ltr",
      "header": {
        "type": "box",
        "layout": "vertical",
        "contents": [
          {
            "type": "text",
            "text": `${pro.displayName}が${hour}時間${min}分${sec}秒勉強しました。`,
            "align": "center",
            "wrap": true
          }
        ]
      },
      "footer": {
        "type": "box",
        "layout": "horizontal",
        "contents": [
          {
            "type": "text",
            "text": "また勉強を始める時は「勉強開始」って呼びかけてね。",
            "wrap": true
          }
        ]
      }
    }
  }*/
  //特定のキーワードに応答
  

   
  return 
}

