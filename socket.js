const { formatMessage, rankings } = require('./utils/util');
const { userJoin, getCurrentUser, userLeave, getRoomUsers, setCorrectPpl, getCorrectPpl, clearCorrectPpl, setAnswer, getAnswer, clearAnswer, asyncUsers, getUserPoint, setUserPoint, delUserPoint, getRmHost, setRmHost, delRmHost, getCounter, setCounter, delCounter} = require('./utils/users');
const { setRoomName, checkOutRoom,getRoomSatus,getAllRoom} = require('./utils/lounge');
var redis = require('redis');
var client = redis.createClient({url: `redis://${process.env.HOST}`});

client.connect().then(async (res) => {
  console.log('connected');
  await client.json.set('roomStatus','.',[]);
  await client.json.set('users','.',[]);
  await client.json.set('answer','.',[]);
  await client.json.set('correctedPpl','.',[]);
  await client.del('rooms');
}).catch((err) => {
  console.log('err: ' + err);
});

let total = 574;
let getCount = 0;
let drawWords = [
  '鐮刀', '雞毛撣子', '水錶', '扳手', '螺絲刀', '指甲鉗', '梳子', '電鑽', '錘子', '公雞'
  , '子彈', '芭蕉扇', '空中飛人', '蒸籠', '暗戀', '露營', '靈魂', '靈車', '水晶球', '芝士蛋糕'
  , '湯匙', '湯圓', '紙巾', '土撥鼠', '俄羅斯輪盤', '共產黨', '鼻炎', '抱石攀岩', '電子鍋', '遙控器'
  , '梅花', '梅花鹿', '斑馬', '葡萄酒', '葡萄乾', '花生油', '垃圾桶', '垃圾', '垃圾車', '垃圾箱'
  , '豬', '犀牛', '兔子', '長頸鹿', '眼鏡蛇', '獅子', '鱷魚', '恐龍'
  , '書', '鋼管舞', '皮影', '詩', '電影', '畫', '印刷'
  , '雙截棍', '匕首', '坦克', '航空母艦', '手槍', '弓箭', '刀', '金箍棒'
  , '金字塔', '橋', '房子', '雷峰塔', '亭'
  , '骰子', '骰盅', '撲克牌', '麻將', '花式跳水', '跳水', '牛奶', '背包', '鋁箔', '罐頭刀'
  , '便當盒', '温室', '壞蛋', '烏龍茶', '壘球', '花式溜冰', '射門', '雪崩', '吊橋', '紅地毯'
  , '龍眼', '英女皇', '麻辣火鍋', '薯片', '糞便', '馬蹄鐵', '鬥牛', '巴黎鐵塔', '眼影', '侍應'
  , '截肢', '護士', '醫生', '護照', '護身符', '太陽能', '流砂', '火柴', '警察', '防火牆'
  , '燒酒', '啤酒', '海膽', '唐老鴨', '黃蜂', '樹蛙', '滅火器', '松鼠', '磁碟', '雀巢'
  , '鹽', '雞排', '蠟像', '蠟燭', '蚯蚓', '二胡', '貨櫃車', '榕樹', '獨眼巨人', '保齡球'
  , '戲院', '燕窩', '燕麥片', '羊', '花木蘭', '浴缸', '高爾夫球', '小刀', '泡泡浴', '鮭魚'
  , '黑夜', '烏雲', '下雨', '雷', '風'
  , '蟬', '蜻蜓', '毛毛蟲', '蚊子', '螢火蟲', '螞蚱'
  , '紅綠燈', '自行車', '輪船', '路燈', '直升機', '火車'
  , '無名指', '耳垂', '屁股', '腳腕', '胃'
  , '掌上明珠', '化妝舞會', '一石二鳥', '花好月圓', '百裡挑一', '坐井觀天'
  , '凱撒沙拉', '敞篷車', '針炙', '針墊', '嬰兒車', '老鼠', '貓', '米奇老鼠', '米妮老鼠', '嚕嚕米'
  , '小熊維尼', '蟻后', '巫師', '巫婆', '焦糖布丁', '提拉米蘇', '奶凍', '泡芙', '千層麵', '蛋黃'
  , '布朗尼', '朱古力', '慕絲蛋糕', '鬆餅', '橡皮鴨', '鴨蛋', '雞蛋', '豬八戒', '西遊記', '孫悟空'
  , '車門', '儀表盤', '窗', '手機殼', '釦子', '螺絲'
  , '醫生', '飛行員', '飛機', '老師', '相機', '卓球', '初戀', '神父', '天使', '細菌'
  , '水泥', '空心磚', '瓦', '玻璃', '石頭', '吸血鬼', '嫦娥', '翻白眼', '豆沙包'
  , '舉重', '游泳', '賽跑', '跳遠', '滑冰', '拳擊'
  , '古箏', '笙', '笛子', '鑼', '長號', '口琴', '吉他'
  , '不倒翁', '魔方', '風箏', '拼圖', '陀螺'
  , '沙漏', '電燈', '魚鉤', '掃把', '杯子'
  , '噴嚏', '沙包', '魚骨', '鴕鳥', '打椿機', '香腸', '汽油彈', '高腰褲', '腰包', '塑膠袋'
  , '壽司', '熊貓', '變形金剛', '披薩', '校長', '蚊香', '冰塊', '冰淇淋', '白雪公主', '哈爾移動城堡'
  , '稻草人', '象牙', '魔鬼氈', '劍鞘', '冰雹', '河流', '拐杖', '輪椅', '籃球', '草莓'
  , '燈籠', '燈泡', '水族館', '螃蟹', '計時炸彈', '包青天', '哈利波特', '太平洋', '作弊', '炸藥'
  , '跑車', '邪教', '剝皮', '骷髏頭', '雪', '温泉', '秋刀魚', '雪橇', '大西洋', '香蕉船'
  , '超能膠', '電視', '電話', '電池', '晴天娃娃', '螢光筆', '筆記本', '草船借箭', '射箭', '骨灰龕位'
  , '小提琴', '鋼琴', '觀音', '按摩椅', '太空人', '潛艇', '打瞌睡', '錢幣', '錢包', '如花'
  , '溜冰鞋', '蜻蜓', '燒烤', '相框', '鑰匙圈', '鑰匙包', '手錶', '手榴彈', '皇冠', '手銬'
  , '帆船', '芭蕾舞', '桌球', '婚禮', '福爾摩斯', '泡菜', '龍', '吸塵器', '護目鏡', '星星'
  , '上吊', '隨地吐痰', '吵鬧', '吸菸', '睡覺'
  , '菊花', '雞腳', '吞拿魚', '午餐肉', '過山車', '雞粉', '乳酪', '囚犯', '蝦醬', '豆腐花', '豆腐', '腰果'
  , '廁所', '火車站', '醫院', '餐廳'
  , '手機', '熱水器', '電腦', '冰箱', '電子秤'
  , '青花瓷', '葫蘆娃', '齙牙', '滑板鞋'
  , '葡萄', '椰子', '火龍果', '菠蘿', '西瓜', '香蕉', '蘋果', '梨子', '青蘋果'
  , '眉筆', '面膜', '口紅', '睫毛膏'
  , '唐僧', '觀世音菩薩', '死神', 'BLACKPINK', 'MAMAMOO', '防彈少年團', '楊貴妃', '楊過', '小龍女', '神鵰俠侶'
  , '射鵰英雄傳', '天龍八部', '鹿鼎記', '韋小寶', '摩托車', '花生', '花生醬', '花生糖', '芝娃娃', '遊艇'
  , '水', '21點', '嬰兒', '狗', '漁夫帽', '守門員', '問卷調查', '閃光燈', '閃避球', '滑雪'
  , '鴨舌帽', '髮卡', '髮簪', '橡皮筋'
  , '麵條', '大盤雞', '冰糖葫蘆', '包子', '餃子', '湯圓'
  , '茄子', '紅薯', '黃瓜', '蘑菇', '木耳', '辣椒', '櫻花'
  , '大本鐘', '長城', '富士山', '東方明珠', '少林寺'
  , '流星', '太陽', '月球', '望遠鏡', '黑洞', '薯條', '雪', '雪糕'
  , '白麵包', '麥包', '白飯', '紅米飯', '蛋麵', '肉醬意粉', '米粉', '生麵', '牛角包', '雞尾包', '菠蘿包'
  , '蓮蓉包', '伊麵', '油麵', '雞翼', '蟹柳', '耳', '耳機', '飛碟', '荷花', '烘乾機', '老虎', '蝴蝶', '護膝', '花朵', '環保', '歡樂谷', '擊劍', '監獄', '教師', '結婚證書',
  , '奶黃包', '魚', 'ktv', '金城武', '王菲', '鸚鵡', '雞', '烏龜', '龍', '聖經', '實驗室', '守門員', '首飾', '手套', '水波', '土豆', '丸子', '橙', '鮮花', '小霸王', '腰帶', '煙斗'
  , '揚州炒飯', '衣櫥', '醫生', '音響', '油', '語文書', '針筒', '紙杯', '日語', '韓語', '鑽戒', '白鴿', '貝迷', '布娃娃', '餐巾', '倉庫', 'CD', '瓷器', '長江三峽', '長頸漏斗'
  , '赤壁', '除草劑', '樹', '大頭魚', '刀', '冬瓜', '豆沙包'
  , '狙擊步槍', '空格鍵', '籃球架', '劉翔', '落地燈', '棉花', '母親', 'NBA', '內褲', '牛奶糖', '牛肉乾', '牛肉麵', '秦始皇兵馬俑'
  , '麥當勞', '沙僧', '蜘蛛', '洋蔥', '檸檬', '三文治', '多士'
  , '游泳', '滑冰', '冥想', '羽毛球', '羽毛', '足球', '世界杯', '奧林匹克運動會', '冥婚', '冥王星'
  , '騎士', '士兵', '王妃', '水母', '豆沙包', '香菸', '香腸', '牛肉乾', '救護車', '通緝犯'
  , '通緝令', '沙拉', '生菜', '酪梨', '牛油果', '醋', '薑', '醬油', '隱形眼鏡', '眼鏡'
  , '口罩', '眼藥水', '薩爾達傳說', '鬼滅之刃', '太鼓達人', '蜘蛛', '迪斯可', '迪士尼'
];

module.exports = function (io) {
  // Run when client connect
  io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`)
    socket.on("join-room", async () => {
      console.log(socket.request.session);
      username = socket.request.session.username;
      room = socket.request.session.room;
      let host = false;
      let roomHost = await getRoomUsers(room);
      if (!roomHost) {
        await setRmHost(room,username);
        host = true;
      }
      const user = await userJoin(socket.id, username, room, host);
      let startGame = await startGameOrNot(user.room);
      //console.log("startGame: " + startGame);
      await setRoomName(room);
      await setUserPoint(socket.id,0);
      io.emit('reloadLoungeStatus',await getAllRoom());
      socket.join(user.room);
      socket.emit('host', host, username, startGame);
      // Send to single user
      // Welcome current connected user
      socket.emit('message', formatMessage('管理員', '歡迎!!^^'));

      // Broadcast to everyone expect the user that's connecting
      // Run when others client connect
      socket.broadcast.to(user.room).emit('message', formatMessage('管理員', `${user.username} 進來了`));

      let users = await getRoomUsers(user.room);
      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: await users
      });
      for (let i = 0; i < users.length; i++) {
        io.to(users[i].id).emit('identify', users[i].username);
      }
    })

/*     async () => {await sub.subscribe('channel', (message) => {
      console.log(message); // 'message'
    });} */

    socket.on("userStatus", (room, username, callback) => {
      if (socket.request.session.room) {
        callback(false);
      } else if (room && username) {
        socket.request.session.room = room;
        socket.request.session.username = username;
        callback(true);
      } else {
        callback(false);
      }
    })

  socket.on('asynUsers', (data) => {
    asyncUsers(data);
  });
  
    // Run when client disconnect
    socket.on("disconnect", async () => {
      console.log(`User disConnected: ${socket.id}`);
      if (socket.request.session.room) {
        //console.log(socket.request.session);
        //delete socket.request.session.username;
        await checkOutRoom(socket.request.session.room);
        delete socket.request.session.room;
        socket.request.session.save();
        socket.emit('removeSession');
        const user = await userLeave(socket.id);
        if (user) {
          let key = user.id;   
          await delUserPoint(key); 
          await delRmHost(user.room);
          //console.log("disconnect user: ");
          //console.log(user);
          let otherRoomUsers = await getRoomUsers(user.room);
          if(otherRoomUsers){
            if (otherRoomUsers.length > 0) {
              await setRmHost(otherRoomUsers[0].room,otherRoomUsers[0].username);
              otherRoomUsers[0].host = true; // Set other ppl to host
              let startGame = await startGameOrNot(otherRoomUsers[0].room);
              //await getRoomSatus(otherRoomUsers[0].room)[0].host = otherRoomUsers[0].username;
              io.to(otherRoomUsers[0].id).emit('host', true, otherRoomUsers[0].username, startGame);
            }
          }
          io.to(user.room).emit('message', formatMessage('管理員', `${user.username} 離開了`));

          // Send users and room info
          let users = await getRoomUsers(user.room);
          if(users){
            io.to(user.room).emit('roomUsers', {
              room: user.room,
              users: users
            });
  
            for (let i = 0; i < users.length; i++) {
              io.to(users[i].id).emit('identify', users[i].username, users[i].host);
            }
          }
        }
        io.emit('reloadLoungeStatus',await getAllRoom());
      }

    })


    async function startGameOrNot(room) {
      let startGame = false;
      let statusOfGame = await getAnswer(room);
        if(statusOfGame){
          if (statusOfGame.playing)
            startGame = true;
        }
        return startGame;
    }

    // Listen for chatMessage
    socket.on("chatMessage", async (msg) => {
      const user = await getCurrentUser(socket.id);
      //console.log("chatMessage user");
      //console.log(user);
      let startGame = await startGameOrNot(user.room);
      if (startGame) {
        let guessWord = await getAnswer(user.room);
        if (msg === guessWord.word) {
          let check = true;
          let checkbfgetCorrectPpl = await getCorrectPpl(user.room);
          if(checkbfgetCorrectPpl){
            if(checkbfgetCorrectPpl.pplArr.includes(socket.id))
              check = false;
          }
          if(check){
            let value = await getCounter(user.room);
            let keyid = socket.id;
            let point = parseInt(await getUserPoint(keyid));
            point += parseInt(value);
            await setUserPoint(keyid,point);
            io.to(socket.id).emit('action', { name: 'correctResponse', msg: formatMessage(user.username, msg) });
            io.to(user.room).emit('message', formatMessage('管理員', `恭喜${user.username}答對了! 加了${value}分，目前分數是${point}`));            
            await setCorrectPpl(user.room, user.id);
          }else {
            io.to(user.room).emit('message', formatMessage(user.username, msg));
          }  
        } else {
          io.to(user.room).emit('message', formatMessage(user.username, msg));
        }
      } else {
        io.to(user.room).emit('message', formatMessage(user.username, msg));
      }
    })

    // Listen for user who are drawing
    socket.on('drawing', async (data) => {
      const user = await getCurrentUser(socket.id);
      socket.broadcast.to(user.room).emit('drawing', data);
    });

    socket.on('startCounter', async (counter) => {
      const user = await getCurrentUser(socket.id);
      let listofplayer = await getRoomUsers(user.room); // Get all users in room
      if(listofplayer){
        for (let i = 0; i < listofplayer.length; i++) {
          let key = listofplayer[i].id;   
          await setUserPoint(key,0); // Reset players point to zero
        }
        gameStart(counter, await listofplayer);
      }
      //io.to(user.room).emit('message', formatMessage('管理員',`遊戲開始嘍!!!!!`));
      // Game start
    });
  })

  async function gameStart(counter, listofplayer) {
    //console.log(listofplayer);
    let currentDrawer = 0;
    let stopGame = false;
    let currentRoom = listofplayer[currentDrawer].room;
    let roomSatus = await getRoomSatus(currentRoom);
    let winScore = roomSatus[0].score;
    console.log("winScore: " + winScore);
    let checked = true; // avoid looping when all user answer correctly
    let guessWord = drawWords[Math.floor(Math.random() * total)];
    await setAnswer(currentRoom, guessWord, true);
    io.to(currentRoom).emit('action', { name: 'gameStartPreparation', msg: formatMessage('管理員', `遊戲開始嘍!!!!! 現在是${listofplayer[currentDrawer].username}畫畫`) });
    io.to(listofplayer[currentDrawer].id).emit('action', { name: 'gameDrawer', msg: `題目:${guessWord}` });
    let countDown = setInterval(async () => {
      counter--;
      await setCounter(currentRoom,counter);
      listofplayer = await getRoomUsers(currentRoom);
      if(listofplayer){
        let getCorrectPeople = await getCorrectPpl(currentRoom);
        let getCorrectPplCount = 0;
        if(getCorrectPeople){
          getCorrectPplCount = getCorrectPeople.count;
        }
        if (getCorrectPplCount === (listofplayer.length - 1) && checked) {
          counter = 5;
          checked = false;
        }

        if (listofplayer.length <= 1){ // check is less than 2 ppl
          stopGame = true;
          counter = 0;
        }
        getCount = counter;
        io.to(currentRoom).emit('counter', counter);
        if (counter === 5) {
          let guessWord = await getAnswer(currentRoom);
          if(guessWord)
            io.to(currentRoom).emit('action', { name: 'onlyLockWhiteboard', msg: `上回答案是${guessWord.word}` });
        }
        if (counter === 0) {
          let temp = [];
          //listofplayer = await getRoomUsers(currentRoom);
          if (!stopGame){ // check is less than 2 ppl
            for (let i = 0; i < listofplayer.length; i++) {
              let getUserPt = parseInt(await getUserPoint(listofplayer[i].id));
              listofplayer[i].point = getUserPt;
              temp.push(getUserPt);
            }
            //emp = await listofplayer.map((value) => { return value.point; });
            let rankingArr = rankings(temp);
            io.to(currentRoom).emit('updateRanking', rankingArr, listofplayer);
          }
          io.to(currentRoom).emit('action', { name: 'clearRound' });
          checked = true;
          counter = 65;
          currentDrawer++;
          await clearCorrectPpl(currentRoom);
          await clearAnswer(currentRoom);
          if (Math.max.apply(Math, temp) >= winScore || stopGame) {
            clearInterval(countDown);
            if (stopGame) {
              io.to(currentRoom).emit('action', { name: 'endGame', msg: formatMessage('管理員', `遊戲人數不足,遊戲結束!!`) });
            } else {
              // Find the index of winner 
              let index = temp.indexOf(Math.max.apply(Math, temp));
              io.to(currentRoom).emit('action', { name: 'endGame', msg: formatMessage('管理員', `恭喜${listofplayer[index].username}贏得這回合!! \n 遊戲結束!!`) });
            }
          } else {
            if (currentDrawer >= listofplayer.length)
              currentDrawer = 0;
            let guessWord = drawWords[Math.floor(Math.random() * total)];
            await setAnswer(currentRoom, guessWord, true);
            io.to(currentRoom).emit('action', { name: 'nextRoundPreparation', msg: formatMessage('管理員', `現在輪到${listofplayer[currentDrawer].username}畫畫`) });
            io.to(listofplayer[currentDrawer].id).emit('action', { name: 'gameDrawer', msg: `題目:${guessWord}` });
          }
        }
      }
    }, 1000)
  }
}