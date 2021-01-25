const express = require('express')
const app = express()
const mongoose = require('mongoose')
const { WebhookClient } = require("dialogflow-fulfillment");
const { welcome, defaultFallback, complaintService } = require("./welcomeExit");

mongoose.connect('mongodb://localhost:27017/numbers', { useNewUrlParser: true,useUnifiedTopology: true })
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('connected to database'))

app.use(express.json())

const numbersRouter = require('./numbers')
app.get('/',(req,res)=>{
    res.send("We are Live")
})
app.use('/numbers', numbersRouter)

app.listen(3000, () => console.log('server started'))

app.post("/", express.json(), (req, res) => {
    const agent = new WebhookClient({ request: req, response: res })
    let intentMap = new Map()
    intentMap.set("ComplaintService - custom", (agent) => {
      let number = agent.parameters['phone-number'];
      let url = `https://cb9deaac5b04.ngrok.io/numbers/${number}`;
      var ID = function () {
        return '_' + Math.random().toString(36).substr(2, 9);
      };
      function getUsername(url){
        const axios = require('axios')
        return axios.get(url)
      }
      let bot_res = "default res"
      return getUsername(url)
      .then(response => {
          // console.log(response) 
          bot_res = `Username ${response.data} Your ticket is generated. Ticket no. for future reference ${ID()}. We'll get back to you ASAP!`
          
        agent.add(bot_res)
      })
      .catch(err => {
        console.log("error occured")
        console.log(err)
        bot_res = "Sorry, No user with the phone number!"
        agent.add(bot_res)
      })

      return db.collection('meeting').add({
        name : name,
        email : email,
        time : Date.now()
      }).then(ref =>
        console.log("Meeting details added to DB")
        )

    })
    agent.handleRequest(intentMap)
}) 

// app.post("/dialogflow", function(req, res) {
//   var speech =
//     req.body.queryResult &&
//     req.body.queryResult.parameters &&
//     req.body.queryResult.parameters.echoText
//       ? req.body.queryResult.parameters.echoText
//       : "Seems like some problem. Speak again.";
  
//   var speechResponse = {
//     google: {
//       expectUserResponse: true,
//       richResponse: {
//         items: [
//           {
//             simpleResponse: {
//               textToSpeech: speech
//             }
//           }
//         ]
//       }
//     }
//   };
  
//   return res.json({
//     payload: speechResponse,
//     //data: speechResponse,
//     fulfillmentText: speech,
//     speech: speech,
//     displayText: speech,
//     source: "webhook-sample"
//   });
// });