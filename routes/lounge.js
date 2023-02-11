const express = require('express');
const router = express.Router();
const {getAllRoom} = require('../utils/lounge.js');
const {getRoomUsers} = require('../utils/users');

router.get('/', (req, res, then) => {
    const obj = getAllRoom();
    return res.json({ status: 'success', result: obj})
}); 

router.post('/', (req, res, then) => {
    if(req.body){
        req.session.room = req.body.room;
        let roomUser = getRoomUsers(req.body.room);
        for (let i = 0; i < roomUser.length; i++) {
            if(roomUser[i].username === req.body.username){
                return res.json({ status: 'error', message: "已經有相同名稱的玩家"});
            }
        }
        
        return res.json({ status: 'success', result: {room:req.body.room}})
    }else   
        return res.json({ status: 'error', message: "發生錯誤"})
});

module.exports = router;