const moment = require('moment-timezone');

function formatMessage(username, text){
    return{
        username,
        text,
        time: moment().tz("Asia/Hong_Kong").format('h:mm a')
    }
}

function rankings(arr) {
    const sorted = [...arr].sort((a, b) => b - a);
    return arr.map((x) => sorted.indexOf(x));
};

module.exports = {
    formatMessage,
    rankings
};