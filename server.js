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

app.post("/", express.json(), (req, res) => {
    const agent = new WebhookClient({ request: req, response: res })
    let intentMap = new Map()
    intentMap.set("ComplaintService - custom", (agent) => {
      let number = agent.parameters['phone-number'];
      let url = `https://e827c50bae50.ngrok.io/numbers/${number}`;
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
          const tNo = ID()
          
          bot_res = `Username ${response.data} Your ticket is generated. Ticket no. for future reference ${tNo}. We'll get back to you ASAP. Thank You!`
        agent.add(bot_res)
        return Number.updateOne(
	      {username: response.data},
	      { $set: { ticketNo: tNo, complaintStatus: "Pending"}}
        ).then(ref =>
        console.log("Meeting details added to DB")
        )
      })
      .catch(err => {
        console.log("error occured")
        console.log(err)
        bot_res = "Sorry, No user with the phone number. Thank You!"
        agent.add(bot_res)
      })


    })
    agent.handleRequest(intentMap)
}) 
