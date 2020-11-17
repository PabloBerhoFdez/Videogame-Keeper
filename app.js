// DEPENDECIES
const express   = require('express')
const mongoose  = require('mongoose')
const chalk     = require ('chalk')
const dotenv    = require ('dotenv')
const hbs       = require ('hbs')
const bodyParser= require ('body-parser')
const bcrypt    = require('bcrypt')
const session   = require('express-session')
const MongoStore= require('connect-mongo')(session)

// CONSTANTS
const app = express()
const Videogame = require('./models/Videogame.js')
const User = require('./models/User.js')

//---- CONFIGURATION ----//
//---Configuracion de .env---//
require('dotenv').config() 
//---Configuracion de hbs---//
app.set('view engine', 'hbs')
app.set('views', __dirname + '/views')
hbs.registerPartials(__dirname + "/views/partials")
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

app.use(session({
  secret: "basic-auth-secret",
  cookie: { maxAge: 60000 },
  saveUninitialized: true,
  resave: true,
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 24 * 60 * 60 // 1 day
  })
}));

// ROUTES

//----RUTA GET DE LA HOME PAGE----//
app.get('/', (req, res, next)=>{
  res.render('home', {session: req.session.currentUser})
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
  console.log(req.session.currentUser)
  if(req.session.currentUser){
    Videogame.find({}, {name: 1, _id:1, imageUrl: 1}, {sort: {rating: -1}})
    .then((videogames)=>{
      res.render('allVideogames', {videogames})
    })
    .catch((err)=>{
      console.log(err)
      res.send(err)
    })
  }else {
    res.redirect('/log-in')
  }
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

//----RUTA PARA CREAR SIGN UP----//
app.get('/sign-up', (req,res,next)=>{
  res.render('signUp')
})

app.post('/sign-up', (req, res, next)=>{
  const {email, password} = req.body
  User.findOne({email: email})
  .then((result)=>{
    if(!result){
      bcrypt.genSalt(10)
      .then((salt)=>{
        bcrypt.hash(password, salt)
        .then((hashedPassword)=>{
          const hashedUser = {email: email, password: hashedPassword}
          User.create(hashedUser)
          .then((result)=>{
            res.redirect('/')
          })
        })
      })
      .catch((err)=>{
        res.send(err)
      })
    } else {
      res.render('logIn', {errorMessage: 'Este usuario ya existe. ¿Querías hacer Log In?'})
    }
  })
})

//----RUTA PARA LOG IN----//
app.get('/log-in', (req,res,next)=>{
  res.render('login')
})

app.post('/log-in',(req,res,next)=>{
  // console.log(req.body)
  const {email, password} = req.body

  User.findOne({email: email})
  .then((result)=>{
    if(!result){
      console.log('El usuario no existe')
      res.render('login', {errorMessage: 'Este usuario no existe, Lo sentimos.'})
    }else{
      bcrypt.compare(password, result.password)
      .then((resultFromBcrypt)=>{
        if(resultFromBcrypt){
          req.session.currentUser = email
          console.log(req.session)
          req.session.destroy()
          console.log(req.session)
          res.redirect('/')
          // req.session.destroy
        }else {
          res.render('login', {errorMessage: 'Contraseña incorrecta. Por favor, vuelva a intentarlo.'})
        }
      })
    }
  })
})

app.get('/log-out', (req,res,next)=>{
  req.session.destroy()
  res.redirect('/')
})


// LISTENER
app.listen(process.env.PORT, ()=>{
  console.log(chalk.blue.inverse.bold(`Conectado al puerto ${process.env.PORT}`))
})