const express = require('express')
const app = express()
const mongoose = require('mongoose')
const { WebhookClient, Payload } = require("dialogflow-fulfillment");
const Number = require('./number')
const axios = require('axios')
const uri = `https://4bf7781b7bb6.ngrok.io`

mongoose.connect('mongodb://localhost:27017/numbers', { useNewUrlParser: true,useUnifiedTopology: true })
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('connected to database'))

app.use(express.json())

const numbersRouter = require('./numbers')

app.use('/numbers', numbersRouter)

app.listen(3000, () => console.log('server started'))

let username = ""
let issueDict

app.get("/", (req, res) => {
  res.sendFile(
    "C:/Users/asus/OneDrive/Desktop/ChatBot/node/chatBot.html"
  )
})

app.post("/", express.json(), (req, res) => {
    const agent = new WebhookClient({ request: req, response: res })
    let intentMap = new Map()

    intentMap.set("ComplaintServiceNumber", (agent) => {
      let number = agent.parameters['phone-number']
      if(number.length!=10){
        agent.add(`Please enter a valid "Phone Number"!`)
        return
      }
      let url = `${uri}/numbers/${number}`
      function getUsername(url){
        return axios.get(url)
      }
      let bot_res = "default res"
      return getUsername(url)
      .then(response => {
          username = response.data
          bot_res = `${username}, please describe your issue!`
        agent.add(bot_res)
      })
      .catch(err => {
        console.log("error occured")
        console.log(err)
        username = `defaultBAN${Math.floor(Math.random()*(999-100+1)+100)}`
        let url1 = `${uri}/numbers`
        axios.post(url1, {
          username: username,
          number: number
        })
        .then(function (response) {
          // console.log(response);
        })
        .catch(err=>console.log(err))
        bot_res = `New User created with your phone number with username ${username}! Please describe your issue!`
        agent.add(bot_res)
      })
    })

    intentMap.set("ComplaintServiceNumberTicket", (agent) => {
      let Buffering = agent.parameters['Buffering']
      let Internet = agent.parameters['Internet']
      let Down = agent.parameters['Down']
      let DNS = agent.parameters['DNS']
      if(DNS || Down || Buffering || Internet){
        let payloadData = {
          "richContent": [
            [
              {
                "type": "list",
                "title": "Internet Down",
                "subtitle": "Press '1' for Internet is down",
                "event": {
                  "parameters": {},
                  "languageCode": "",
                  "name": ""
                }
              },
              {
                "type": "divider"
              },
              {
                "event": {
                  "name": "",
                  "languageCode": "",
                  "parameters": {}
                },
                "title": "Buffering",
                "type": "list",
                "subtitle": "Press '2' Buffering"
              },
              {
                "type": "divider"
              },
              {
                "event": {
                  "languageCode": "",
                  "name": "",
                  "parameters": {}
                },
                "subtitle": "Press '3' for DNS problem",
                "type": "list",
                "title": "DNS problem"
              }
            ]
          ]
        }
      issueDict = {
        1 : "Internet Down",
        2 :  "Buffering",
        3 :  "DNS problem"
      }
      agent.add( new Payload(agent.UNSPECIFIED, payloadData, {sendAsMessage: true, rawPayload: true }))
      }
      else{
        agent.end("We don't do that here!")
      }
    })

    intentMap.set("ComplaintServiceNumberTicketConfirm", (agent) => {
      let issue = agent.parameters["number"]
      console.log(issue)
      console.log(issueDict)
      if(issue>3 || issue<1){
        agent.add("Please enter a valid choice!")
        return
      }
      var ID = function () {
        return '_' + Math.random().toString(36).substr(2, 9)
      }
      let bot_res = "default res"
        const tNo = ID()
        bot_res = `${username}, your complaint has been registered on ${issueDict[issue]}! Ticket number for future reference is ${tNo}. Thank you for your time!`
        agent.end(bot_res)
        return Number.updateOne(
	      {username: username},
	      { $set: { ticketNo: tNo, complaintStatus: "Pending", issue: issueDict[issue]}}
        ).then(ref =>
        console.log("Ticket details added to DB")
        )
    })

    agent.handleRequest(intentMap)
}) 
