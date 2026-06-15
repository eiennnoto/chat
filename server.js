const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

let onlineCount = 0;

const users = new Map();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const messages = [];

io.on("connection", (socket) => {

    // 接続時に履歴を送信
    socket.emit("chat history", messages);

    socket.on("chat message", (msg) => {

        messages.push(msg);

        // 100件を超えたら古いものを削除
        if (messages.length > 100) {
            messages.shift();
        }

        io.emit("chat message", msg);
    });

    socket.on("change name", (newName, callback) => {

    newName = newName.trim();

    if (!newName) {
        callback(false, "名前を入力してください");
        return;
    }

    const used = [...users.values()].includes(newName);

    if (used && users.get(socket.id) !== newName) {
        callback(false, "その名前は使用中です");
        return;
    }

    users.set(socket.id, newName);

    callback(true);
});

    socket.on("disconnect", () => {
    users.delete(socket.id);
});

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
