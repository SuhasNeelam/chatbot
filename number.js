const mongoose = require('mongoose')

const numberSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  number: {
    type: String,
    required: true
  },
})

module.exports = mongoose.model('number', numberSchema)