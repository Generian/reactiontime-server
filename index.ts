const express = require('express')
const app = express()
const h = require('./scores')
var morgan = require('morgan')

app.use(morgan('tiny', {
  skip: function (req, res) { return req.method !== 'POST' }
}))

app.use(express.json())

app.get('/api/highscores', (request, response) => {
  response.json(h)
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})