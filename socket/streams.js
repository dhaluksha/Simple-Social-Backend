module.exports = function(io, User, _) {
    const userData = new User();
    io.on('connection', socket => {
        // console.log('User connected');
        socket.on('refresh', (data) => {
            io.emit('refreshPage', {});
        });

        socket.on('online', (data) => {
            socket.join(data.room);
            userData.EnterRoom(socket.id, data.user, data.room);
            const list = userData.GetRoomList(data.room);
            io.emit('usersOnline', _.uniq(list));
        });
        
        socket.on('disconnect', () => {
            const user = userData.RemoveUser(socket.id);
            if(user){
                const userArry = userData.GetRoomList(user.room);
                const arr = _.uniq(userArry)
                _.remove(arr, n => n === user.name);
                io.emit('usersOnline', arr);
            }
        })
    })    
}