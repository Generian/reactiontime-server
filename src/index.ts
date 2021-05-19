require('dotenv').config()
const express = require('express')
const app = express()
const Highscore = require('./highscore')
var morgan = require('morgan')

// Globals
const LEADERBOARD_LENGTH = 25

// Enpoints

app.use(morgan('tiny', {
  skip: function (req, res) { return req.method !== 'POST' }
}))

app.use(express.json())

app.get('/api/ping', (request, response) => {
  response.json({connection: 'OK'})
})

app.get('/api/highscores', (request, response) => {
  Highscore.find({})
  .then(highscores => {
    response.json(highscores)
  })
  .catch(err => {
    console.log(err)
    return response.status(400).json({ error: err })
  })
})

app.post('/api/highscores', (request, response) => {
  const body = request.body

  if (body.time === undefined || body.name === undefined || body.highscoreType === undefined) {
    return response.status(400).json({ error: 'content missing' })
  }

  const filter = body.highscoreType === "THREE_AVG" ? { highscoreType: "THREE_AVG" } : { highscoreType: { $not: /THREE_AVG/ } } 

  Highscore.find( filter ).then(highscores => {

    const h = new Highscore({
      "time": body.time,
      "date": Date.now(),
      "name": body.name,
      "highscoreType": body.highscoreType,
    })
    console.log(highscores.length)
    if (highscores.length < LEADERBOARD_LENGTH) {
      try {      
        h.save().then(savedHighscore => {
          response.json(savedHighscore)
        })
      } catch(error) {
        console.error(error)
        return response.status(400).json({ error: 'failed to save highscore (add)' })
      }    
    } else {
      try {
        Highscore.find( filter ).sort({time:-1}).limit(1).then(s => { 
          const slowest = s[0]
          if (slowest.time > h.time) {
            Highscore.deleteOne( { "time" : slowest.time } )
            .then(() => {
              console.log(`Deleting slowest time ${slowest.time}`)
            })
            .catch(err => {
              return response.status(400).json({ 
                message: "Time qualifies, but failed to delete slowest time from leaderboard.",
                error: err })
            })
            h.save()
            .then(savedHighscore => {
              response.json(savedHighscore)
            })
            .catch(err => {
              return response.status(400).json({ 
                message: "Time qualifies, but failed to save new time to leaderboard.",
                error: err })
            })
          } else {
            return response.status(400).json({ error: "score doesn't qualify" })
          }
        })
      } catch(error) {
        console.error(error)
        return response.status(400).json({ error: 'failed to save highscore (replace)' })
      }
    }
  })
})

app.post('/api/highscores/qualify', (request, response) => {
  const body = request.body

  if (body.time === undefined || body.highscoreType === undefined) {
    return response.status(400).json({ error: 'content missing' })
  }

  const filter = body.highscoreType === "THREE_AVG" ? { time: { $lte: body.time }, highscoreType: "THREE_AVG" } : { time: { $lte: body.time }, highscoreType: { $not: /THREE_AVG/ } } 

  Highscore.find( filter ).then(highscores => {
    response.json({
      "qualifies": highscores.length < LEADERBOARD_LENGTH,
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
