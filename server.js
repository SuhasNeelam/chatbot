const express = require('express')
const app = express()
const mongoose = require('mongoose')
const { WebhookClient } = require("dialogflow-fulfillment");
const Number = require('./number')

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

let username = ""

app.post("/", express.json(), (req, res) => {
    const agent = new WebhookClient({ request: req, response: res })
    let intentMap = new Map()
    intentMap.set("ComplaintServiceNumber", (agent) => {
      let number = agent.parameters['phone-number'];
      let url = `http://da85b235ba31.ngrok.io/numbers/${number}`;
      function getUsername(url){
        const axios = require('axios')
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
        bot_res = "Sorry, No user with the phone number. Thank You!"
        agent.end(bot_res)
      })


    })
    intentMap.set("ComplaintServiceNumberTicket", (agent) => {
      let issue = agent.parameters["any"]
      var ID = function () {
        return '_' + Math.random().toString(36).substr(2, 9);
      };
      let bot_res = "default res"
        const tNo = ID()
        bot_res = `${username}, your complaint has been registered! Ticket number for future reference is ${tNo}. Thank you for your time!`
        agent.end(bot_res)
        return Number.updateOne(
	      {username: username},
	      { $set: { ticketNo: tNo, complaintStatus: "Pending", issue: issue}}
        ).then(ref =>
        console.log("Ticket details added to DB")
        )
    })
    agent.handleRequest(intentMap)
}) 
