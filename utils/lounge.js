let rooms = [];
let roomStatus = [];
const {getUsers,getRoomUsers} = require('../utils/users.js');


//
function setRoomName(room){
    if(!rooms.includes(room)){
        rooms.push(room);
    }
    return rooms;
}

// Get current room
function getAllRoom() {
    let roomStatus = [];
    for (let i = 0; i < rooms.length; i++) {
        let count = getRoomUsers(rooms[i]).length;
        let temp = getRoomSatus(rooms[i]);
        roomStatus.push({roomName: rooms[i],count:count, totalPpl: temp[0].ppl, totalScore: temp[0].score, host: temp[0].host}); 
    }
    return roomStatus;
}

function checkOutRoom(room){
    if (getRoomUsers(room).length <= 1){
        const index = rooms.indexOf(room);
        const idx = roomStatus.findIndex(status => status.room === room);
        if (index > -1) { // only splice array when item is found
            rooms.splice(index, 1);// 2nd parameter means remove one item only
            roomStatus.splice(idx, 1)[0];
        }
    }
    return rooms;
}

function setRoomSatus(room,host,ppl,score){
    let temp = {room,host,ppl,score};
    roomStatus.push(temp);
    return roomStatus;
}

function getRoomSatus(room){
    return roomStatus.filter(status => status.room === room);
}

module.exports = {
    getAllRoom,
    setRoomName,
    checkOutRoom,
    setRoomSatus,
    getRoomSatus
};