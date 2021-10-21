// const WebSocket = require('ws');
const SocketIO = require('socket.io');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const cookie = require('cookie-signature');

module.exports = (server, app, sessionMiddleware) => {
    const io = SocketIO(server, { path: '/socket.io'});
    app.set('io',io);
    const room = io.of('/room');
    const chat = io.of('/chat');

    io.use((socket, next) => {
        cookieParser(process.env.COOKIE_SECRET)(socket.request, socket.request.res || {}, next);
        sessionMiddleware(socket.request, socket.request.res || {}, next);
    });
        // const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
        // chat.use(wrap(cookieParser(process.env.COOKIE_SECRET)));
        // chat.use(wrap(sessionMiddleware));  버전!

    room.on('connection', (socket) => {
        console.log('room 네임스페이스에 접속');
        socket.on('disconnect', () => {
            console.log('room 네임스페이스 접속 헤제');
        });
    });

    chat.on('connection', (socket) => {
        console.log('chat 네임스페이스에 접속');
        const req = socket.request;
        const { headers: {referer} } = req;
        // console.log('리퍼럴?',referer);
        // console.log(req.session);
        const roomId = referer
            .split('/')[referer.split('/').length - 1]
            .replace(/\?.+/,'');
        socket.join(roomId);
        socket.to(roomId).emit('join', {
            user: 'system',
            chat: `${req.session.color}님이 입장하셨습니다.`,
        });
        // const currentRoom = socket.adapter.rooms[roomId]; 버전업되면서 자동으로 방을 설정해줌 Set()
        socket.on('disconnect', () => {
            console.log('chat 네임스페이스 접속 해제');
            socket.leave(roomId);
            const currentRoom = socket.adapter.rooms[roomId];
            const userCount = currentRoom ? currentRoom.length : 0;
            if(userCount === 0){ //유저가 0명이면 방 삭제
                const signedCookie = cookie.sign(req.signedCookies['connect.sid'], process.env.COOKIE_SECRET);
                const connectSID = `${signedCookie}`;
                axios.delete(`http://localhost:8005/room/${roomId}`,{
                    headers: {
                        Cookie: `connect.sid=s%3A${connectSID}`
                    }
                })
                .then(() => {
                    console.log(`${roomId}방 제거 요청 성공`);
                })
                .catch((error) => {
                    console.error(error);
                });
            }
            else{
                // const currentRoom = socket.adapter.rooms.length;
                console.log(currentRoom);
                socket.to(roomId).emit('exit', {
                    user: 'system',
                    chat: `${req.session.color}님이 퇴장하셨습니다.`,
                });
            }
        });
    });
};



// socket.io 기본형태
// module.exports = (server) => {
//     const io = SocketIO(server, { path: '/socket.io' });

//     io.on('connection', (socket) => { //웹소켓 연결 시
//         const req = socket.request;
//         const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress; //ip파악
//         console.log('새로운 클라이언트 접속!', ip, socket.id, req.ip);
//         socket.on('disconnect', () => { // 연결 종료 시
//             console.log('클라이언트 접속 해제', ip, socket.id);
//             clearInterval(socket.interval);
//         });
//         socket.on('error', (error) => { //에러시
//             console.error(error);
//         });
//         socket.on('reply', (data) => { // 클라이언트로부터 메시지
//             console.log(data);
//         });

//         socket.interval = setInterval(() => { // 3초마다 클라이언트로 메시지 전송
//             socket.emit('news', 'Hello Socket.IO');
//         }, 3000);
//     });
// };

//websocket 기본형태
// module.exports = (server) => {
//     const wss = new WebSocket.Server({ server });

//     wss.on('connection', (ws, req) => { //웹소켓 연결 시
//         const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress; //ip파악
//         console.log('새로운 클라이언트 접속', ip);
//         ws.on('message', (message) => { // 클라이언트로부터 메시지
//             console.log(message);
//         });
//         ws.on('error', (error) => { //에러시
//             console.error(error);
//         });
//         ws.on('close', () => { //연결 종료시
//             console.log('클라이언트 접속 해체', ip);
//             clearInterval(ws.interval);
//         });

//         ws.interval = setInterval(() => { // 3초마다 클라이언트로 메시지 전송
//             if(ws.readyState === ws.OPEN){
//                 ws.send('서버에서 클라이언트 메시지를 보냅니다.');
//             }
//         }, 3000);
//     });
// };