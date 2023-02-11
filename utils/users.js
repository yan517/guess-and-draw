const users = [];
let answers = [];
let confirmLeave = false;

// Join user to chat 
function userJoin(id, username, room , host){
    const point = 0;
    const user = {id, username, room, host, point};
    users.push(user);
    return user;
}

// Get current user
function getCurrentUser(id) {
    return users.find(user => user.id === id);
}

// User leaves chat
function userLeave(id){
    const index = users.findIndex(user => user.id === id);
    if(index !== -1){
        return users.splice(index,1)[0];
    }
}

// Get room users
function getRoomUsers(room){
    return users.filter(user => user.room === room);
}

function setCorrectPpl(room,id){
    const answer = {room, id};
    answers.push(answer);
    return answer;
}

function getCorrectPpl(room){
    return answers.filter(answer => answer.room === room);
}

function clearCorrectPpl(){
    answers = [];
    return answers;
}

function getConfirmLeave(){
    return confirmLeave;
}

function setConfirmLeave(value){
    //console.log("value: " + value);
    confirmLeave = value;
}

function getUsers(){
    return users;
}

module.exports = {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers,
    setCorrectPpl,
    getCorrectPpl,
    clearCorrectPpl,
    getConfirmLeave,
    setConfirmLeave,
    getUsers
};