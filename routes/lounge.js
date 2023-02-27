const express = require('express');
const router = express.Router();
const {getAllRoom,setRoomSatus,getRoomSatus} = require('../utils/lounge.js');
const {getRoomUsers} = require('../utils/users');

router.get('/', (req, res, then) => {
    const obj = getAllRoom();
    return res.json({ status: 'success', result: obj})
}); 

router.post('/', (req, res, then) => {
    if(req.session.room){
        return res.json({ status: 'error', message: "你已進入房間"});
    }else if(req.body){
        let roomUser = getRoomUsers(req.body.room);
        let ppl = 0;
        if(roomUser.length < 1){
            let host = req.body.username;
            ppl = req.body.ppl;
            let score = req.body.score;
            setRoomSatus(req.body.room,host,ppl,score);
        }else{
            let roomSatus = getRoomSatus(req.body.room);
            ppl = roomSatus[0].ppl;
        }
        if(roomUser.length < ppl){
            for (let i = 0; i < roomUser.length; i++) {
                if(roomUser[i].username === req.body.username){
                    return res.json({ status: 'error', message: "已經有相同名稱的玩家"});
                }
            }
            return res.json({ status: 'success', result: {room:req.body.room}})
        }else{
            return res.json({ status: 'error', message: "額滿了"})
        }
    }else   
        return res.json({ status: 'error', message: "發生錯誤"})
});

module.exports = router;