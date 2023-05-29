const { config, staticFiles, mongocredentialsession, usersessiontime } = require('../config/environment')
const { logger, loggererr } = require('../log/logger')
const { websocket } = require('../websocket/socketservice')

const express = require('express')
const cluster = require('cluster')
const numCPUs = require('os').cpus().length
const http = require('http')
const socketIo = require('socket.io')
const mongoStore = require('connect-mongo')
const expressSession = require('express-session')
const { engine } = require('express-handlebars')

const path = require ("path")
const productRouter = require('../routes/productRouter')
const cartRouter = require('../routes/cartRouter')
const chatRouter = require('../routes/chatRouter.js')
const sessionRouter = require('../routes/sessionRouter')
const infoRouter = require('../routes/infoRouter')

const advancedOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true
}

const createServer = () => {

  const app = express()
  const server = http.createServer(app)
  const io = socketIo(server)

  app.set('views', path.resolve(__dirname, '../views'))
  app.engine('hbs', engine({ extname: 'hbs' }))
  app.set('view engine', 'hbs')

  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(express.static(staticFiles))
  try {
    app.use(expressSession({
      store: mongoStore.create({
        mongoUrl: mongocredentialsession,
        mongoOptions: advancedOptions
      }),
      secret: 'secret-pin',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: Number(usersessiontime)
      }
    }))
  } catch (error) {
    logger.error(`Error en la conexion a la base de datos: ${error}`)  
  } 

  websocket( io )

  app.use('/session', sessionRouter)

  app.use('/api', productRouter)

  app.use('/api', cartRouter)

  app.use('/api', chatRouter)

  app.use('/info', infoRouter)

  app.get('*', (req, res, next) => {
    const fileExtension = path.extname(req.url)
    if (fileExtension === '.ico') {
      next()
    } else {
      logger.warn(`Ruta: ${req.url}, método: ${req.method} no implementada`)
      res.send(`Ruta: ${req.url}, método: ${req.method} no implementada`)
    }
  })

  return { server, io }
}


const startCluster = () => {
  if (cluster.isPrimary) {
    logger.info('Server in CLUSTER mode')
    logger.info('----------------------')
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork()
    }
  } else {
    logger.info(`Worker ${cluster.worker.id} started`)
    PORT = config.same === 1 ? PORT + cluster.worker.id - 1 : PORT
    try {
      createServer().server.listen(PORT, () => {
        logger.info(`Worker ${cluster.worker.id} listening on port ${PORT}`)
      })
    } catch (error) {
      logger.error(`Error starting worker ${cluster.worker.id}: ${error}`)
    }
  }
}

const startFork = () => {
  logger.info('Server in FORK mode')
  logger.info('-------------------')
  try {
    createServer().server.listen(PORT, () => {
      logger.info(`Server listening on port ${PORT}`)
    })
  } catch (error) {
    logger.error(`Error starting server: ${error}`)
  }
}


let PORT = ( config.port ) ? config.port : 8080 // puerto por defecto 8080

if (config.mode === 'CLUSTER') {
  startCluster()
} else {
  startFork()
}