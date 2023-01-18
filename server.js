const express = require('express');
const mongoose = require('mongoose');
const cookiParser = require('cookie-parser');
const cors = require('cors');
const _ = require('lodash');

const app = express();
app.use(cors());

const server = require('http').createServer(app);
const io = require('socket.io')(server, { cors:{ origin: '*' } });

const {User} = require('./helpers/userClass');
require('./socket/streams')(io, User, _);
require('./socket/private')(io);

const dbConfig = require('./config/secret');
const auth = require('./routes/authRoutes');
const posts = require('./routes/postRoutes');
const users = require('./routes/userRoute');
const friends = require('./routes/friendsRoutes');
const message = require('./routes/messageRoutes');
const image = require('./routes/imageRoutes');


app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({extended: true, limit: '50mb'}))
app.use(cookiParser());

mongoose.Promise = global.Promise;
mongoose.connect(
    dbConfig.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(
    console.log('db running')
);

app.use('/api/chatapp', auth);
app.use('/api/chatapp', posts);
app.use('/api/chatapp', users);
app.use('/api/chatapp', friends);
app.use('/api/chatapp', message);
app.use('/api/chatapp', image);

server.listen(5000, ()=> {
    console.log('Server Running On Port: 5000');
})