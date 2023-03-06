let rooms = [];
let roomStatus = [];
const {getUsers,getRoomUsers, getRmHost} = require('../utils/users.js');
var redis = require('redis');
var client = redis.createClient({url: `redis://${process.env.HOST}`});

client.connect().then(async (res) => {
  console.log('connected');
})

//
async function setRoomName(room){
    let currentRooms = await client.lRange('rooms',0,-1);
        if (currentRooms.length == 0)
            await client.rPush('rooms',`${room}`);
        else{
            if(!currentRooms.includes(room))
                await client.rPush('rooms',`${room}`);
        }
}

// Get current room
async function getAllRoom() {
    let roomStatus = [];
    let currentRooms = await client.lRange('rooms',0,-1);
    if (currentRooms.length > 0){
        for (let i = 0; i < currentRooms.length; i++) {
            let roomNme = await currentRooms[i];
            let getRoomStatus = await client.json.get('roomStatus');
            if(getRoomStatus.length > 0){
                let rmSatus = await getRoomStatus.filter(status => status.room === roomNme);
                let users = await client.json.get('users')
                if(users.length > 0){
                    let rmUsr = await users.filter(user => user.room === roomNme);
                    let host = await getRmHost(roomNme);
                    console.log("host");
                    console.log(host);
                    roomStatus.push({roomName: roomNme,count:rmUsr.length, totalPpl: rmSatus[0].ppl, totalScore: rmSatus[0].score, host: host});
                }
            }
        }
    }

    return roomStatus;
}

async function checkOutRoom(room){
    let getRmUser = await getRoomUsers(room);
    if (getRmUser.length <= 1){
        let currentRooms = await client.lRange('rooms',0,-1);
        const index = await currentRooms.indexOf(room);
        let roomSt = await client.json.get('roomStatus');

        const idx = await roomSt.findIndex(status => status.room === room);
        if (index > -1) { // only splice array when item is found
            await client.lRem('rooms',index,room);
            //rooms.splice(index, 1);// 2nd parameter means remove one item only
            await client.json.arrPop('roomStatus','$',[idx]);
/*             let rmSt = await client.json.get('roomStatus');
            if(!rmSt){
                await client.json.set('roomStatus','.',[]);
            } */
            //roomStatus.splice(idx, 1)[0];
        }
    }
}

async function setRoomSatus(room,host,ppl,score){
    //let temp = {room,host,ppl,score};
    await client.json.arrAppend('roomStatus', '.', {room,host,ppl,score});
    //roomStatus.push(temp);
    let rmStatus = await client.json.get('roomStatus');
    return rmStatus;
}

async function getRoomSatus(room){
    let roomSt = await client.json.get('roomStatus');
    if(roomSt.length > 0){
        return await roomSt.filter(status => status.room === room);
    }else 
        return null;
}

function getRooms() {
    return rooms;
}

module.exports = {
    getAllRoom,
    setRoomName,
    checkOutRoom,
    setRoomSatus,
    getRoomSatus,
    getRooms
};