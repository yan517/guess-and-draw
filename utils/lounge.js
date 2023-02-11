let rooms = [];
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
        roomStatus.push({roomName: rooms[i],count:count}); 
    }
    //console.log(roomStatus);
    return roomStatus;
}

function checkOutRoom(room){
    if (getRoomUsers(room).length <= 1){
        const index = rooms.indexOf(room);
        if (index > -1) { // only splice array when item is found
            rooms.splice(index, 1);// 2nd parameter means remove one item only
        }
    }
    return rooms;
}

module.exports = {
    getAllRoom,
    setRoomName,
    checkOutRoom
};