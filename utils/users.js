const users = [];
let correctedPpl = [];
let confirmLeave = false;
let answer = [];

function setAnswer(room,word,playing){
    answer.push({room,word,playing});
    console.log(answer);
    return answer;
}

function getAnswer(room){
    return answer.filter(ans => ans.room === room);
}

function clearAnswer(room){
    const index = answer.findIndex(ans => ans.room === room);
    if(index !== -1){
        return answer.splice(index,1)[0];
    }
}

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
    const index = correctedPpl.findIndex(correctPpl => correctPpl.room === room);
    if(index !== -1){
        correctedPpl[index].pplArr.push(id);
        correctedPpl[index].count++;
    }else{
        let pplArr = [];
        pplArr.push(id);
        correctedPpl.push({room,pplArr,count:1});
    }
    console.log(correctedPpl);
}

function getCorrectPpl(room){
    const index = correctedPpl.findIndex(correctPpl => correctPpl.room === room);
    if(index !== -1){
        return correctedPpl[index];
    }
    return 0;//correctedPpl.filter(correctPpl => correctPpl.room === room);
}

function clearCorrectPpl(room){
    const index = correctedPpl.findIndex(correctPpl => correctPpl.room === room);
    if(index !== -1){
        return correctedPpl.splice(index,1)[0];
    }
    return correctedPpl;
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
    getUsers,
    setAnswer,
    getAnswer,
    clearAnswer
};