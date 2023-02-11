class MyRepository {
    constuctor() {
        room = '';
        username = '';
    }
 
    setRoom(room) {
        this.room = room;
    }
 
    getRoom() {
        return this.room;
    }

    setUsername(user) {
        this.username = user;
    }
 
    getUser() {
        return this.username;
    }
 }
 
 let repo = new MyRepository();
 module.exports = repo;