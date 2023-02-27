const form = document.querySelector('#createRoomForm');
const createRoomBtn = document.querySelector('#createRoom');
const createRoomFrom = document.querySelector('#createRoomDiv');
const cancelBtn = document.querySelector('#cancel');
const emptyArea = document.querySelector('#empty-area');
const roomArea = document.querySelector('.roomAreaGrid');
const cover = document.querySelector('#cover');


const getLoungeStatus = async () => {
    const response = await fetch(`/currentLoungeStatus`, {
        method: 'GET'
    });
    const json = await response.json();
     if (json.status == "success"){
        //console.log(json.result);
        if(json.result.length < 1){
            emptyArea.style.display = 'block';
        }else{
            emptyArea.style.display = 'none';
            let len = json.result.length;
            let element = json.result;
            for (let i = 0; i < len; i++) {
                let name = element[i].roomName;
                let count = element[i].count;
                const div = document.createElement("div");
                div.classList = "room-area-item";
                if(count >= element[i].totalPpl){
                    count = "已額滿!"
                    div.style.cursor = "default";
                }else{
                    div.addEventListener("click",(e)=>{
                        goToRoom(name);
                    });
                }

/*                 let random = Math.floor(Math.random() * 4);
                if (random == 1)
                    div.style.backgroundColor = "#fde0e5";
                else if (random == 2)
                    div.style.backgroundColor = "#cfe7c4";
                else if (random == 3)
                    div.style.backgroundColor = "#ffeca9";      */    
                const title = document.createElement("p");
                title.textContent = "房間名稱";
                const p1 = document.createElement("p");
                p1.textContent = name;
                p1.classList = "room-name";
                const host = document.createElement("p");
                host.textContent = "房主名稱";
                const hostname = document.createElement("p");
                hostname.textContent = element[i].host;
                hostname.classList = "room-name";
                const people = document.createElement("p");
                people.textContent = "房間人數";
                const p2 = document.createElement("p");
                p2.classList = "room-name";
                if(count === "已額滿!")
                    p2.textContent = count;
                else
                    p2.textContent = count + "/" + element[i].totalPpl;
                const scoreP = document.createElement("p");
                scoreP.textContent = "所需得分";
                const score = document.createElement("p");
                score.textContent = element[i].totalScore;
                score.classList = "room-name";
                div.appendChild(title);
                div.appendChild(p1);
                div.appendChild(host);
                div.appendChild(hostname);
                div.appendChild(people);
                div.appendChild(p2);
                div.appendChild(scoreP);
                div.appendChild(score);
                roomArea.appendChild(div);
            }
        }
        
    }else
        alert(json.status);  
}
getLoungeStatus();
/* document.addEventListener("DOMContentLoaded", function(event) { 
    roomArea.innerHTML = '';
    getLoungeStatus();
  }); */

socket.on('reloadLoungeStatus', () =>{
    roomArea.innerHTML = '';
    getLoungeStatus();
})

if(form){
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let room = document.querySelector('#room').value;
        let ppl = document.querySelector('#numOfppl').value;
        let score = document.querySelector('#score').value;
        if (room === ""){
                alert('房間名字不能空');
        }else{
            goToRoom(room.trim(),ppl,score);
        }
    });
}

cancelBtn.addEventListener('click',(e)=>{
    createRoomFrom.style.display = 'none';
    cover.style.display = 'none';
})

cover.addEventListener('click',(e)=>{
    createRoomFrom.style.display = 'none';
    cover.style.display = 'none';
})

createRoomBtn.addEventListener('click', (e) => {
    createRoomFrom.style.display = 'flex';
    cover.style.display = 'block';
    
})

const goToRoom = async (room,ppl,score) => {
    const response = await fetch(`/currentLoungeStatus`, {
        method: 'POST',
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({room: room, username: sessionStorage.getItem("username"),ppl,score})
    });
    const json = await response.json();
     if (json.status == "success"){
        sessionStorage.setItem("room", json.result.room);
        window.location.href = `/chat`;
    }else
        alert(json.message);  
}

window.onpageshow = function(event) {
    if (event.persisted) {
      window.location.reload() 
    }
  };