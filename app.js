// DEPENDECIES
const express   = require('express')
const mongoose  = require('mongoose')
const chalk     = require ('chalk')
const dotenv    = require ('dotenv')
const hbs       = require ('hbs')
const bodyParser= require ('body-parser')

// CONSTANTS
const app = express()
const Videogame = require('./models/Videogame.js')

// CONFIGURATION 
require('dotenv').config() //Configuracion de .env
app.set('view engine', 'hbs') //Configuracion de hbs
app.set('views', __dirname + '/views') //Configuracion de hbs
//config mongoose
mongoose.connect(`mongodb://localhost/${process.env.DATABASE}`, {
  useCreateIndex: true,
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false
})
.then((result)=>{
  console.log(chalk.cyan(`Connected to Mongo! Database used: ${result.connections[0].name}`))
})
.catch((error)=>{
  console.log(chalk.red(`There has been an error: ${error}`))
})

app.use(bodyParser.urlencoded({ extended: true }))  //Configuracion de body parser


// ROUTES
app.get('/', (req, res, next)=>{

  // const newVideogame = {
  //   name: 'The Legend of Zelda: Ocarina of Time',
  //   platform: ['Nintendo 64','GameCube', 'iQue Player'],
  //   genre: ['Action', 'Adventure'],
  //   developer: 'Nintendo',
  //   releaseDate: '1998-12-11',
  //   rating: 99,
  //   pegi: '12'
  // }

  Videogame.create(newVideogame)
  .then((result)=>{
    console.log(result)
  })
  .catch((error)=>{
    console.log(error)
  })
  res.render('home')
})

app.get('/newVideogame', (req, res, next)=>{
  res.render('newVideogame')
})

app.post('/newVideogame', (req, res, next)=>{

  const splitString =(_string)=>{
    const genreString = _string
    const splittedGenreString = genreString.split(', ')
    return splittedGenreString
  }

  const arrayPlatform = splitString(req.body.platform)
  const arrayGenre = splitString (req.body.genre)

  const newVideogame = {...req.body, genre: arrayGenre, platform: arrayPlatform}


  Videogame.create(newVideogame) 
    .then((result)=>{
      console.log(result)
   })
    .catch((error)=>{
      console.log(error)
    })

})

app.get('/allVideogames', (req, res, next)=>{
  Videogame.find({}, {name: 1, _id:0})
  .then((videogames)=>{
    res.render('allVideogames', {videogames})
  })
  .catch((err)=>{
    console.log(err)
    res.send(err)
  })
})



// LISTENER
app.listen(process.env.PORT, ()=>{
  console.log(chalk.blue.inverse.bold(`Conectado al puerto ${process.env.PORT}`))
})