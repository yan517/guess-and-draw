const chatForm = document.querySelector('#chat-form');
const roomName = document.querySelector('#room-name');
const UserList = document.querySelector('#users');
const startCounter = document.querySelector('#startCounter');
const leaveRm = document.querySelector('#leaveButton');
const rankingList = document.querySelector('#ranking');
let roomGuessword = '';

/* function avoidReload() {
    return window.location.href = `/lounge`;
  } */

window.onload = function() {
    let reloading = sessionStorage.getItem("reloading");
    if (reloading) {
        sessionStorage.removeItem("reloading");
        return window.location.href = `/lounge`; 
    }else{
        sessionStorage.setItem("reloading", "true");
    }
}

socket.emit('userStatus',sessionStorage.getItem("room"),sessionStorage.getItem("username"),(callback)=>{
    if (callback){
        socket.emit('join-room');
    }else{
        sessionStorage.removeItem("reloading");
        return window.location.href = `/lounge`;
    }
})

//const socket = io({closeOnBeforeunload: false});
// Get username and room from URL
/* const {username , room} = Qs.parse(location.search,{
    ignoreQueryPrefix: true
}); */

socket.on('removeSession',()=>{
    sessionStorage.removeItem("room");
    sessionStorage.removeItem("reloading");
})

socket.on('host', (host, username,startGame) =>{
    if (host){
        document.querySelector('#startCounter').style.display = 'block';
        if(startGame)
            startCounter.disabled = true;
    }else
        document.querySelector('#startCounter').style.display = 'none';
})

socket.on('message', message =>{
    outputMsg(message);
    // Scroll down
    document.querySelector('.chat-messages').scrollTop = document.querySelector('.chat-messages').scrollHeight;
})


socket.on('counter', (counter) =>{
    document.querySelector('#counter').textContent = counter;
})

socket.on('roomUsers', ({ room,users }) =>{
    outputRoomName(room);
    outputRoomUsers(users);
})

socket.on('action', (value) =>{
    if(value.name){
        if(value.name === "onlyLockWhiteboard"){
        document.querySelector('.whiteboard').style['pointer-events'] = "none";
        document.querySelector('.whiteboard-container').style.cursor = "not-allowed";
        //document.querySelector('.whiteboard-container').style.opacity = "0.7";
        document.querySelector('#msg').disabled = true;
        document.querySelector('#sendMsg').disabled = true;
        document.querySelector('#quest').textContent = value.msg;
        }else if(value.name === "endGame"){
            document.querySelector('#quest').textContent = "";
            // set msg field to original former
            document.querySelector('#msg').disabled = false;
            document.querySelector('#sendMsg').disabled = false; 
            document.querySelector('#msg').placeholder = "輸入文字...";
            startCounter.disabled = false;
            // reset timer
            document.querySelector('#counter').textContent = 65;
            // clear all drawing
            context.clearRect(0, 0, canvas.width, canvas.height);
            // output msg
            outputMsg(value.msg);
            // Scroll down
            document.querySelector('.chat-messages').scrollTop = document.querySelector('.chat-messages').scrollHeight;
        }else if(value.name === "clearRound"){
            // lock Canvas
            document.querySelector('.whiteboard').style['pointer-events'] = "none";
            document.querySelector('.whiteboard-container').style.cursor = "not-allowed";
            //document.querySelector('.whiteboard-container').style.opacity = "0.7";
            document.querySelector('#msg').disabled = false;
            document.querySelector('#msg').placeholder = "請猜猜看...";
            document.querySelector('#sendMsg').disabled = false;
            // clear all drawing
            context.clearRect(0, 0, canvas.width, canvas.height);
        }else if(value.name === "correctResponse"){
            //document.querySelector('#msg').disabled = true;
            document.querySelector('#msg').placeholder = "你已經答對了^^";
            //document.querySelector('#sendMsg').disabled = true;
            // output msg
            outputMsg(value.msg);
            // Scroll down
            document.querySelector('.chat-messages').scrollTop = document.querySelector('.chat-messages').scrollHeight; 
        }else if(value.name === "gameStartPreparation"){
            // lock Canvas
            document.querySelector('.whiteboard').style['pointer-events'] = "none";
            document.querySelector('.whiteboard-container').style.cursor = "not-allowed";
            //document.querySelector('.whiteboard-container').style.opacity = "0.7";
            document.querySelector('#msg').disabled = false;
            document.querySelector('#msg').placeholder = "請猜猜看...";
            document.querySelector('#sendMsg').disabled = false;
            // output msg
            outputMsg(value.msg);
            // Scroll down
            document.querySelector('.chat-messages').scrollTop = document.querySelector('.chat-messages').scrollHeight;             
        }else if(value.name === "gameDrawer"){
            // unlockCanvas
            unlockCanvas();
            document.querySelector('#quest').textContent = value.msg;        
        }else if(value.name === "nextRoundPreparation"){
            //resetTimer
            document.querySelector('#counter').textContent = 65;
            // clear question
            document.querySelector('#quest').textContent = "";
            // output msg
            outputMsg(value.msg);
            // Scroll down
            document.querySelector('.chat-messages').scrollTop = document.querySelector('.chat-messages').scrollHeight;   
        }
    } 

})


function unlockCanvas(){
    document.querySelector('.whiteboard').style['pointer-events'] = "all";
    document.querySelector('.whiteboard-container').style.cursor = "crosshair";
    //document.querySelector('.whiteboard-container').style.opacity = "1";
    document.querySelector('#msg').disabled = true;
    document.querySelector('#msg').placeholder = "你正在畫畫哦^_^";
    document.querySelector('#sendMsg').disabled = true;
}

socket.on('identify', (username) =>{
    let arrLength = document.querySelector("#users").getElementsByTagName('li').length;
    for (let i = 0; i < arrLength; i++) {
        if(document.querySelector("#users").getElementsByTagName('li').item(i).textContent === username){
            document.querySelector("#users").getElementsByTagName('li').item(i).style.color = '#ffeb3b';
            document.querySelector("#users").getElementsByTagName('li').item(i).textContent += " ";
            let crown = document.createElement('span');
            crown.classList.add('fa-solid', 'fa-crown');
            document.querySelector("#users").getElementsByTagName('li').item(i).appendChild(crown);
        }
    }
})

socket.on('updateRanking', (rankingArr,user) =>{
    rankingList.innerHTML = '';
    for (let i = 0; i < rankingArr.length;) {
        let index = rankingArr.indexOf(i);
        if (index != -1){
            let result = user.filter(function(element){  // return same scores
                return element['point'] == user[index].point; 
            });
            for (let y = 0; y < result.length; y++) {
                let li = document.createElement('li');
                li.textContent = i+1 + ". " + result[y].username + " "+ result[y].point+ "分";
                rankingList.appendChild(li);
            }
            i+=result.length;
        }
    }
})

chatForm.addEventListener('submit', (e) => {
    e.preventDefault(); // prevent automatically submit to a file
    const msg = e.target.elements.msg.value;
    // Emit message to server
    socket.emit('chatMessage', msg);
    // Clear input 
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
})

startCounter.addEventListener('click',(e) =>{
    let counter = 65;
    startCounter.disabled = true;
    rankingList.innerHTML = '';
    socket.emit('startCounter', counter);
})

leaveRm.addEventListener('click',(e) =>{
    let confirmLeave = true;
    sessionStorage.removeItem("reloading");
    socket.emit('clearSession',true,(callback) =>{});
    document.cookie = 'room=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
})

function outputMsg(message){
    const div = document.createElement('div');
    const p1 = document.createElement('p');
    if(message.username === "管理員"){
        div.classList.add('adminMessage');
        p1.classList.add('adminMeta');
    }
    else{
        if (message.username === sessionStorage.getItem("username"))
            div.classList.add('messagePosition');
        div.classList.add('message');
        p1.classList.add('meta');
    }
    p1.textContent = message.username;
    
    const span = document.createElement('span');
    span.textContent = "  " + message.time;
    p1.appendChild(span);
    const p = document.createElement('p');
    p.textContent = message.text;
    div.appendChild(p1);
    div.appendChild(p);
    document.querySelector('.chat-messages').appendChild(div);
}

function outputRoomName(room) {
    roomName.textContent = room;
}

function outputRoomUsers(users) {
    UserList.innerHTML = `${users.map(user => `<li>${user.username}</li>`).join('')}`;
}

localStorage.openpages = Date.now();
var onLocalStorageEvent = function(e){
  if(e.key == "openpages"){
    // Emit that you're already available.
    localStorage.page_available = Date.now();
  }
  if(e.key == "page_available"){
    alert("One more page already open");
    window.location.href = `/`;
  }
  
};
window.addEventListener('storage', onLocalStorageEvent, false);