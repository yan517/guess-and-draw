//let users = [];
//let correctedPpl = [];
//let answer = [];
var redis = require('redis');
var client = redis.createClient({url: `redis://${process.env.HOST}`});

client.connect().then(async (res) => {
  console.log('connected');
})

async function setAnswer(room,word,playing){
    await clearAnswer(room);
    await client.json.arrAppend('answer', '.', {room,word,playing});
    //answer.push({room,word,playing});
    //console.log(answer);
}

async function getAnswer(room){
    let rmPlayStatus = await client.json.get('answer');
    const index = await rmPlayStatus.findIndex(ans => ans.room === room);
    if(index !== -1){
        console.log("rmPlayStatus[index]");
        console.log(rmPlayStatus[index]);
        return await rmPlayStatus[index];
    }else
        return null;
}

async function clearAnswer(room){
    let answer = await client.json.get('answer');
    const index = await answer.findIndex(ans => ans.room === room);
    if(index !== -1){
        return await client.json.arrPop('answer','$',[index]);
        //return answer.splice(index,1)[0];
    }
}

// Join user to chat 
async function userJoin(id, username, room , host){
    await client.json.arrAppend('users', '.', {id:id,username:username,room:room,host:host,point:0});
    const point = 0;
    const user = {id, username, room, host, point};
    //users.push(user);
    return user;
}

function asyncUsers(data){
    users = data;
    console.log("async");
    console.log(users);
}

// Get current user
async function getCurrentUser(id) {
    let users = await client.json.get('users');
    if(users.length > 0)
        return await users.find(user => user.id === id);
}

// User leaves chat
async function userLeave(id){
    let users = await client.json.get('users');
    if(users.length > 0){
        const index = await users.findIndex(user => user.id === id);
        if(index !== -1){
            let user = await users[index];
            await client.json.arrPop('users', '$', [index]);
            //let user = users.splice(index,1)[0];
            return user;
        }
    }
    
}

// Get room users
async function getRoomUsers(room){
    let users = await client.json.get('users');
    if(users){
        let tmp = await users.filter(user => user.room === room);
        if(tmp.length > 0){
            return tmp;
        }else
            return null;
    }else
    return null;
}

async function setCorrectPpl(room,id){
    let correctedPpl = await client.json.get('correctedPpl');
    let index = await correctedPpl.findIndex(correctPpl => correctPpl.room === room);
    if(index !== -1){
        let count = correctedPpl[index].count + 1;
        let room = correctedPpl[index].room;
        let pplArr = correctedPpl[index].pplArr;
        pplArr.push(id);
        await client.json.arrAppend('correctedPpl', '.', {room,pplArr,count});
        await client.json.arrPop('correctedPpl', '$', [index]);

        //await client.json.set('correctedPpl',`[${index}].count` , count++);
        //await client.json.ARRAPPEND('correctedPpl', '$', [index], pplArr, id);
        //correctedPpl[index].pplArr.push(id);
        //correctedPpl[index].count++;
    }else{
        let pplArr = [];
        pplArr.push(id);
        await client.json.arrAppend('correctedPpl', '.', {room,pplArr,count:1});
        //correctedPpl.push({room,pplArr,count:1});
    }
}

async function getCorrectPpl(room){
    let correctedPpl = await client.json.get('correctedPpl');
    const index = await correctedPpl.findIndex(correctPpl => correctPpl.room === room);
    if(index !== -1){
        return correctedPpl[index];
    }
    return 0;//correctedPpl.filter(correctPpl => correctPpl.room === room);
}

async function clearCorrectPpl(room){
    let correctedPpl = await client.json.get('correctedPpl');
    const index = correctedPpl.findIndex(correctPpl => correctPpl.room === room);
    if(index !== -1){
        await client.json.arrPop('correctedPpl', '$', [index]);
        //return correctedPpl.splice(index,1)[0];
    }
    return correctedPpl;
}

async function getUserPoint(id){
    let key = id+"point";
    let point = await client.get(key);
        return point;
}

async function setUserPoint(id,value){
    let key = id+"point";
    console.log(key);
    let point = await client.set(key,value);
    return point;
}

async function delUserPoint(id){
    let key = id+"point";
    await client.del(key);
} 


async function getRmHost(room){
    let key = room+"host";
    let username = await client.get(key);
    return username;
}

async function setRmHost(room,username){
    let key = room+"host";
    console.log(key);
    let urname = await client.set(key,username);
    return urname;
}

async function delRmHost(room){
    let key = room+"host";
    await client.del(key);
}

async function getCounter(room){
    let key = room+"count";
    let ct = await client.get(key);
    return ct;
}

async function setCounter(room,count){
    let key = room+"count";
    console.log(key);
    let ct = await client.set(key,count);
    return ct;
}

async function delCounter(room){
    let key = room+"count";
    await client.del(key);
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
    getUsers,
    setAnswer,
    getAnswer,
    clearAnswer,
    asyncUsers,
    getUserPoint,
    setUserPoint,
    delUserPoint,
    getRmHost,
    setRmHost,
    delRmHost,
    getCounter,
    setCounter,
    delCounter
};