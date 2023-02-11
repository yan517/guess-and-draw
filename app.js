const path = require("path");
const http = require("http"); // create http server
const express = require('express'); // express server
const socketio = require("socket.io");
const {formatMessage, rankings} = require('./utils/util');
const {userJoin, getCurrentUser, userLeave, getRoomUsers, setCorrectPpl, getCorrectPpl, clearCorrectPpl, setConfirmLeave, getConfirmLeave} = require('./utils/users');
const {setRoomName,checkOutRoom} = require('./utils/lounge');
const app = express(); 
const server = http.createServer(app);
const io = socketio(server);

let session = require("express-session")({
  secret: "my-secret",
  resave: false,
  saveUninitialized: false
});

const cors = require("cors");
const PORT = process.env.PORT || 3500;

let startGame = false;
let total = 415;
let guessWord = '';
let getCounter = 0;

let drawWords = [
  '鐮刀','雞毛撣子','水錶','扳手','螺絲刀','指甲鉗','梳子','電鑽','錘子','公雞'
  ,'子彈','芭蕉扇','空中飛人','蒸籠','暗戀','露營','靈魂','靈車','水晶球','芝士蛋糕'
  ,'湯匙','湯圓','紙巾','土撥鼠','俄羅斯輪盤','共產黨','鼻炎','抱石攀岩','電子鍋','遙控器'
  ,'梅花','梅花鹿','斑馬','葡萄酒','葡萄乾','花生油','垃圾桶','垃圾','垃圾車','垃圾箱'
  ,'豬','犀牛','兔子','長頸鹿','眼鏡蛇','獅子','鱷魚','恐龍'
  ,'書','鋼管舞','皮影','詩','電影','畫','印刷'
  ,'雙截棍','匕首','坦克','航空母艦','手槍','弓箭','刀','金箍棒'
  ,'金字塔','橋','房子','雷峰塔','亭'
  ,'黑夜','烏雲','下雨','雷','風'
  ,'蟬','蜻蜓','毛毛蟲','蚊子','螢火蟲','螞蚱'
  ,'紅綠燈','自行車','輪船','路燈','直升機','火車'
  ,'無名指','耳垂','屁股','腳腕','胃'
  ,'掌上明珠','化妝舞會','一石二鳥','花好月圓','百裡挑一','坐井觀天'
  ,'凱撒沙拉','敞篷車','針炙','針墊','嬰兒車','老鼠','貓','米奇老鼠','米妮老鼠','嚕嚕米'
  ,'小熊維尼','蟻后','巫師','巫婆','焦糖布丁','提拉米蘇','奶凍','泡芙','千層麵','蛋黃'
  ,'布朗尼','朱古力','慕絲蛋糕','鬆餅','橡皮鴨','鴨蛋','雞蛋','豬八戒','西遊記','孫悟空'
  ,'車門','儀表盤','窗','手機殼','釦子','螺絲'
  ,'醫生','飛行員','飛機','老師','相機','卓球','初戀','神父','天使','細菌'
  ,'水泥','空心磚','瓦','玻璃','石頭','吸血鬼','嫦娥','翻白眼','豆沙包'
  ,'舉重','游泳','賽跑','跳遠','滑冰','拳擊'
  ,'古箏','笙','笛子','鑼','長號','口琴','吉他'
  ,'不倒翁','魔方','風箏','拼圖','陀螺'
  ,'沙漏','電燈','魚鉤','掃把','杯子'
  ,'上吊','隨地吐痰','吵鬧','吸菸','睡覺'
  ,'菊花','雞腳','吞拿魚','午餐肉','過山車','雞粉','乳酪','囚犯','蝦醬','豆腐花','豆腐','腰果'
  ,'廁所','火車站','醫院','餐廳'
  ,'手機','熱水器','電腦','冰箱','電子秤'
  ,'青花瓷','葫蘆娃','齙牙','滑板鞋'
  ,'葡萄','椰子','火龍果','菠蘿','西瓜','香蕉','蘋果','梨子','青蘋果'
  ,'眉筆','面膜','口紅','睫毛膏'
  ,'唐僧','觀世音菩薩','死神','BLACKPINK','MAMAMOO','防彈少年團','楊貴妃','楊過','小龍女','神鵰俠侶'
  ,'射鵰英雄傳','天龍八部','鹿鼎記','韋小寶','摩托車','花生','花生醬','花生糖','芝娃娃','遊艇'
  ,'水','21點','嬰兒','狗','漁夫帽','守門員','問卷調查','閃光燈','閃避球','滑雪'
  ,'鴨舌帽','髮卡','髮簪','橡皮筋'
  ,'麵條','大盤雞','冰糖葫蘆','包子','餃子','湯圓'
  ,'茄子','紅薯','黃瓜','蘑菇','木耳','辣椒','櫻花'
  ,'大本鐘','長城','富士山','東方明珠','少林寺'
  ,'流星','太陽','月球','望遠鏡','黑洞','薯條','雪','雪糕'
  ,'白麵包','麥包','白飯','紅米飯','蛋麵','肉醬意粉','米粉','生麵','牛角包','雞尾包','菠蘿包'
  ,'蓮蓉包','伊麵','油麵','雞翼','蟹柳','耳','耳機','飛碟','荷花','烘乾機','老虎','蝴蝶','護膝','花朵','環保','歡樂谷','擊劍','監獄','教師','結婚證書',
  ,'奶黃包','魚','ktv','金城武','王菲','鸚鵡','雞','烏龜','龍','聖經','實驗室','守門員','首飾','手套','水波','土豆','丸子','橙','鮮花','小霸王','腰帶','煙斗'
  ,'揚州炒飯','衣櫥','醫生','音響','油','語文書','針筒','紙杯','日語','韓語','鑽戒','白鴿','貝迷','布娃娃','餐巾','倉庫','CD','瓷器','長江三峽','長頸漏斗'
  ,'赤壁','除草劑','樹','大頭魚','刀','冬瓜','豆沙包'
  ,'狙擊步槍','空格鍵','籃球架','劉翔','落地燈','棉花','母親','NBA','內褲','牛奶糖','牛肉乾','牛肉麵','秦始皇兵馬俑'
  ,'麥當勞','沙僧','蜘蛛','洋蔥','檸檬','三文治','多士'
  ,'游泳','滑冰','冥想','羽毛球','羽毛','足球','世界杯','奧林匹克運動會','冥婚','冥王星'
  ,'騎士','士兵','王妃','水母','豆沙包','香菸','香腸','牛肉乾','救護車','通緝犯'
  ,'通緝令','沙拉','生菜','酪梨','牛油果','醋','薑','醬油','隱形眼鏡','眼鏡'
  ,'口罩','眼藥水','薩爾達傳說','鬼滅之刃','太鼓達人','蜘蛛','迪斯可','迪士尼'
];

// Use express-session middleware for express
app.use(session);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Load MVC routes
let currentUserStatus = require('./routes/index');
let currentLoungeStatus = require('./routes/lounge');

const corsOptions = {
    origin: [
      'https://www.guessdraws.com',
      'http://www.guessdraws.com',
      'http://localhost:3500',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
  
app.use(cors(corsOptions));
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

// only allow authenticated users
io.use((socket, next) => {
  const session = socket.request.session;
  if (session && session.authenticated) {
    next();
  } else {
    next(new Error("unauthorized"));
  }
});


  // Run when client connect
io.on("connection",(socket) =>{
  console.log(`User Connected: ${socket.id}`)
    if(socket.request.session.username && socket.request.session.room){
        username = socket.request.session.username;
        room = socket.request.session.room;
        let host = false;
        if(getRoomUsers(room).length < 1)
          host = true;
        const user = userJoin(socket.id,username,room,host);
        setRoomName(room);
        io.emit('reloadLoungeStatus');
        socket.join(user.room);
        
        socket.emit('host', host,username);
        // Send to single user
        // Welcome current connected user
        socket.emit('message', formatMessage('管理員','歡迎!!^^'));
    
        // Broadcast to everyone expect the user that's connecting
        // Run when others client connect
        socket.broadcast.to(user.room).emit('message', formatMessage('管理員',`${user.username} 進來了`));
    
        let users = getRoomUsers(user.room);
        // Send users and room info
        io.to(user.room).emit('roomUsers', {
          room: user.room,
          users: users
        });
        for (let i = 0; i < users.length; i++) {
          io.to(users[i].id).emit('identify', users[i].username);
        }
    }
  

  // Run when client disconnect
  socket.on("disconnect", ()=>{
    console.log(`User disConnected: ${socket.id}`);
    //console.log(socket.request.session);
     if (socket.request.session.room) {
      //delete socket.request.session.username;
      checkOutRoom(socket.request.session.room);
      delete socket.request.session.room;
      socket.request.session.save();
      const user = userLeave(socket.id);
      console.log(socket.request.session);
      if(user){
        let otherRoomUsers = getRoomUsers(user.room);
        if(otherRoomUsers.length > 0){
          otherRoomUsers[0].host = true; // Set other ppl to host
          io.to(otherRoomUsers[0].id).emit('host', true, otherRoomUsers[0].username);
        }
          
        io.to(user.room).emit('message', formatMessage('管理員',`${user.username} 離開了`));

        // Send users and room info
        let users = getRoomUsers(user.room);
        io.to(user.room).emit('roomUsers', {
          room: user.room,
          users: users
        });
        
        for (let i = 0; i < users.length; i++) {
          io.to(users[i].id).emit('identify', users[i].username, users[i].host);
        }
      }
      io.emit('reloadLoungeStatus'); 
    }
  })

  // Listen for chatMessage
  socket.on("chatMessage", (msg)=>{
    const user = getCurrentUser(socket.id);
    if (startGame){
      if (guessWord != ''){
        if (msg === guessWord){
          let value = getCounter;
          user.point += value;
          //io.to(socket.id).emit('message',formatMessage(user.username, msg));
          io.to(socket.id).emit('action',{name:'correctResponse',msg:formatMessage(user.username, msg)});
          io.to(user.room).emit('message',formatMessage('管理員', `恭喜${user.username}答對了! 加了${value}分，目前分數是${user.point}`));

          setCorrectPpl(user.room, user.id);
        }else{
          io.to(user.room).emit('message',formatMessage(user.username, msg));
        }
      }
    }else{
      io.to(user.room).emit('message',formatMessage(user.username, msg));
    }
  })

  // Listen for user who are drawing
  socket.on('drawing', (data) => {
    const user = getCurrentUser(socket.id);
    socket.broadcast.to(user.room).emit('drawing', data);
  });

  socket.on('startCounter', (counter) => {
    const user = getCurrentUser(socket.id);
    let listofplayer = getRoomUsers(user.room); // Get all users in room
    for (let i = 0; i < listofplayer.length; i++) {
      listofplayer[i].point = 0;   // Reset players point to zero
    }
    io.to(user.room).emit('message', formatMessage('管理員',`遊戲開始嘍!!!!!`));
    // Game start
    gameStart(counter,listofplayer); 

  });
})

function gameStart(counter,listofplayer){
  //console.log(listofplayer);
  let winScore = 100;
  let currentDrawer = 0;
  let stopGame = false;
  let currentRoom = listofplayer[currentDrawer].room;
  let checked = true; // avoid looping when all user answer correctly
  let temp;
  startGame = true;


  guessWord = drawWords[Math.floor(Math.random() * total)];
  io.to(currentRoom).emit('action',{name:'gameStartPreparation',msg:formatMessage('管理員',`現在是${listofplayer[currentDrawer].username}畫畫`)});
  io.to(listofplayer[currentDrawer].id).emit('action',{name:'gameDrawer',msg:formatMessage('管理員',`題目是${guessWord}`)});
  //io.to(currentRoom).emit('message', formatMessage('管理員',`現在是${listofplayer[currentDrawer].username}畫畫`));
  //io.to(listofplayer[currentDrawer].id).emit('message', formatMessage('管理員',`題目是${guessWord}`));
  let countDown = setInterval(()=>{
    counter--;
    if(getCorrectPpl(currentRoom).length === (listofplayer.length-1) && checked){
      counter = 5;
      checked =  false;
    }
    getCounter = counter;
    io.to(currentRoom).emit('counter',counter);
    if (counter === 5) {
      io.to(currentRoom).emit('action','onlyLockWhiteboard');
    }
    if (counter === 0) {
      listofplayer = getRoomUsers(currentRoom); 
      if (listofplayer.length <= 1) // check is less than 2 ppl
        stopGame = true;
      else{
        temp = listofplayer.map((value)=>{ return value.point;});
        let rankingArr = rankings(temp);
        io.to(currentRoom).emit('updateRanking',rankingArr,listofplayer);
      }
      io.to(currentRoom).emit('action',{name:'clearRound', msg:formatMessage('管理員',`上回答案是${guessWord}`)});
      //io.to(currentRoom).emit('clearCanvas','');
      //io.to(currentRoom).emit('message', formatMessage('管理員',`上回答案是${guessWord}`));
      checked = true;
      counter = 65;
      currentDrawer++;
      clearCorrectPpl();
      if (Math.max.apply(Math, temp) >= winScore || stopGame) {
        guessWord = '';
        clearInterval(countDown);
        //io.to(currentRoom).emit('action','endGame');
        startGame = false;
        if (stopGame){
          io.to(currentRoom).emit('action', {name:'endGame', msg:formatMessage('管理員',`遊戲人數不足,遊戲結束!!`)});
        }else{
          // Find the index of winner 
          let index = temp.indexOf(Math.max.apply(Math, temp));
          io.to(currentRoom).emit('action', {name:'endGame', msg:formatMessage('管理員',`恭喜${listofplayer[index].username}贏得這回合!! \n 遊戲結束!!`)});
        }
      }else{
        if(currentDrawer >= listofplayer.length)
          currentDrawer = 0;
        guessWord = drawWords[Math.floor(Math.random() * total)];
        io.to(currentRoom).emit('action',{name:'nextRoundPreparation',msg:formatMessage('管理員',`現在輪到${listofplayer[currentDrawer].username}畫畫`)});
        //io.to(currentRoom).emit('message', formatMessage('管理員',`現在輪到${listofplayer[currentDrawer].username}畫畫`));
        io.to(listofplayer[currentDrawer].id).emit('action', {name:'gameDrawer',msg:formatMessage('管理員',`題目是${guessWord}`)});
        //io.to(listofplayer[currentDrawer].id).emit('action','unlockCanvas');
      }
    }  
  },1000)
}

server.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`);
})

module.exports = app;