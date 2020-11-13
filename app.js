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

//---- CONFIGURATION ----//
//---Configuracion de .env---//
require('dotenv').config() 
//---Configuracion de hbs---//
app.set('view engine', 'hbs')
//Configuracion de hbs---//
app.set('views', __dirname + '/views') 
//---config mongoose---//
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

//---Configuracion de body parser---//
app.use(bodyParser.urlencoded({ extended: true }))

//---Configuracion carpeta estatica---//
app.use(express.static(__dirname + '/public'))


// ROUTES

//----RUTA GET DE LA HOME PAGE----//
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

//----RUTA GET PARA CREAR VIDEOJUEGO NUEVO----//
app.get('/newVideogame', (req, res, next)=>{
  res.render('newVideogame')
})

//----RUTA POST PARA CREAR VIDEOJUEGO----//
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
      res.redirect('/allVideogames')
    })
    .catch((error)=>{
      console.log(error)
    })

})

//----RUTA GET PARA VER UN VIDEOJUEGO----//
app.get('/videogame/:id', (req, res, next)=>{
  const videogameID = req.params.id

  Videogame.findById(videogameID)
  .then((result)=>{
    res.render('singleVideogame',result)
  })
  .catch((err)=>{
    console.log(err)
    res.send(err)
  })
})
//----RUTA GET PARA VER TODOS LOS VIDEOJUEGOS----//
app.get('/allVideogames', (req, res, next)=>{
  Videogame.find({}, {name: 1, _id:1, imageUrl: 1})
  .then((videogames)=>{
    res.render('allVideogames', {videogames})
  })
  .catch((err)=>{
    console.log(err)
    res.send(err)
  })
})
//----RUTA POST PARA ELIMINAR VIDEOJUEGO ESPECIFICO----//
app.post('/delete-game/:id', (req,res,next)=>{
  const id = req.params.id

  Videogame.findByIdAndDelete(id)
  .then(()=>{
    res.redirect('/allVideogames')
  })
  .catch((err)=>{
    console.log(err)
    res.send(err)
  })
})
//----RUTA GET PARA VER LA EDICION DE JUEGO ESPECIFICO----//
app.get('/editVideogame/:id', (req,res,next)=>{
  const id = req.params.id
  Videogame.findById(id)
    .then((result)=>{
      res.render('editForm', result)
    })
    .catch((err)=>{
      console.log(err)
      res.send(err)
    })
})
//----RUTA POST PARA EDITAR VIDEOJUEGO ESPECIFICO----//
app.post('/editVideogame/:id', (req,res,next)=>{
  const id = req.params.id
  const editedVideogame = req.body
  
  Videogame.findByIdAndUpdate(id, editedVideogame)
  .then(()=>{
    res.redirect(`/videogame/${id}`)
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