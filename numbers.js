const express = require('express')
const router = express.Router()
const Number = require('./number')

router.get('/', async (req, res) => {
  try {
    console.log("get")
    const numbers = await Number.find()
    res.json(numbers)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/', async (req, res) => {
  const number = new Number({
    username: req.body.username,
    number: req.body.number
  })

  try {
    const newNumber = await number.save()
    res.status(201).json(newNumber)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

router.get('/:id', getNumber, (req, res) => {
  res.json(res.number.username)
})

async function getNumber(req, res, next) {
  try {
    number = await Number.findOne({number:req.params.id})
    if (number == null) {
      return res.status(404).json({ message: 'Cant find Number'})
    }
  } catch(err){
    return res.status(500).json({ message: err.message })
  }
  
  res.number = number
  next()
}

module.exports = router