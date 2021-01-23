const express = require('express')
const app = express()
const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/numbers', { useNewUrlParser: true,useUnifiedTopology: true })
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('connected to database'))

app.use(express.json())

const numbersRouter = require('./numbers')
app.use('/numbers', numbersRouter)

app.listen(3000, () => console.log('server started'))