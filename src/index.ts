require('dotenv').config()
const express = require('express')
const app = express()
const Highscore = require('./highscore')
var morgan = require('morgan')

app.use(morgan('tiny', {
  skip: function (req, res) { return req.method !== 'POST' }
}))

app.use(express.json())

app.get('/api/highscores', (request, response) => {
  Highscore.find({}).then(highscores => {
    response.json(highscores)
  })
})

app.post('/api/highscores', (request, response) => {
  const body = request.body

  if (body.time === undefined || body.name === undefined) {
    return response.status(400).json({ error: 'content missing' })
  }

  const highscore = new Highscore({
    time: body.time,
    date: Date.now(),
    name: body.name,
  })

  highscore.save().then(savedHighscore => {
    response.json(savedHighscore)
  })
})

app.post('/api/highscores/qualify', (request, response) => {
  const body = request.body
  console.log(request)

  if (body.time === undefined) {
    return response.status(400).json({ error: 'content missing' })
  }

  Highscore.find( { time: { $lte: body.time } } ).then(highscores => {
    response.json({
      "qualifies": highscores.length < 7,
      "rank": highscores.length + 1,
    })
  })
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
