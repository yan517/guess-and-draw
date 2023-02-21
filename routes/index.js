const express = require('express');
const router = express.Router();
const repo = require('../utils/init.js');

router.post('/', (req, res, then) => {
    if(req.body){
        //req.session.username = req.body.username;
        return res.json({ status: 'success', result: {username:req.body.username}})
    }else   
        return res.json({ status: 'error', result: "發生錯誤"})
});

router.get('/', (req, res, then) => {
    const username = repo.getUser();
    const room = repo.getRoom();
    return res.json({ status: 'success', result: {username:username,room:room}})
}); 

module.exports = router;