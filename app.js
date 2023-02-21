const path = require("path");
const http = require("http"); // create http server
const express = require('express'); // express server
const socketio = require("socket.io");
const app = express(); 
const server = http.createServer(app);
const io = socketio(server);

let session = require("express-session")({
  secret: "my-secret",
  resave: false,
  saveUninitialized: false
});

/* const cors = require("cors"); */
const PORT = process.env.PORT || 3500;

// Use express-session middleware for express
app.use(session);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Load MVC routes
let currentUserStatus = require('./routes/index');
let currentLoungeStatus = require('./routes/lounge');

/* const corsOptions = {
    origin: [
      'https://www.guessdraws.com',
      'http://www.guessdraws.com',
      'http://localhost:3500',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
  
app.use(cors(corsOptions)); */
app.use(express.json());

app.use('/currentUserStatus', currentUserStatus);
app.use('/currentLoungeStatus', currentLoungeStatus);

app.get("/", (req,res) =>{
  res.sendFile(path.join(__dirname, "templates", "index.html"));
});

app.get("/lounge", (req,res) =>{
  res.sendFile(path.join(__dirname, "templates", "lounge.html"));
});

app.get("/chat", (req,res) =>{
  res.sendFile(path.join(__dirname, "templates", "chat.html"));
});


// convert a connect middleware to a Socket.IO middleware
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

io.use(wrap(session));



// Load Socket.IO controller
//const socketController = require('./socket')(io);
require('./socket')(io);

server.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`);
})

module.exports = app;