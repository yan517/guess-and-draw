const express = require('express');
const router = express.Router();
const {getAllRoom} = require('../utils/lounge.js');
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
        if (roomUser.length < 100){
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