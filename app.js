const express = require("express");
const app = express();
const userRouter = require("./routes/user");
const articleRouter = require("./routes/articles");
const messageRouter = require("./routes/message");
const bodyParser = require("body-parser");
const { ConfirmToken } = require("./utils/authentication");
const connect = require("./utils/db");
var server = require("http").createServer(app);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
require("express-async-errors");
const io = require("socket.io")(server, {
  cors: true,
});

app.all("*", function (req, res, next) {
  //设置允许跨域的域名，*代表允许任意域名跨域
  res.header("Access-Control-Allow-Origin", "*");
  //允许的header类型
  res.header("Access-Control-Allow-Headers", "content-type,authorization");
  //跨域允许的请求方式
  res.header("Access-Control-Allow-Methods", "DELETE,PUT,POST,GET,OPTIONS");
  if (req.method.toLowerCase() == "options") res.send(200);
  //让options尝试请求快速结束
  else next();
});
const whiteList = ["/user/login", "/user/register", "/user/email"];
io.on("connection", function (socket) {
  // 在这里建立链接?
  // console.log("a user connected");

  socket.on("disconnect", function () {
    // console.log("a user go out");
  });
  socket.on("user_connect", async function (token) {
    const decode = ConfirmToken(token);
    const { id } = decode.userInfo;
    await connect(`update users set socket_id='${socket.id}' where id=${id}`);
    // 这里就不做token异常 链接失败处理了
    // 可以在这里把全部的message数据推送回去
  });

  // io.to(socketId).emit("add",data)
  socket.on("message", async function (obj) {
    const { from, to, type, message = "", urls = [] } = JSON.parse(obj);
    await connect(
      `insert into messages (from_id,to_id,type,message,urls) values (${from},${to},${type},'${message}','${urls.join(
        ","
      )}')`
    );
    // 查询to的socketId
    const toUser = await connect(`select socket_id from users where id=${to}`);
    const toSoketId = toUser[0].socket_id;
    // 推送数据过去
    io.to(toSoketId).emit("getMessage");
  });
});

app.use("/", (req, res, next) => {
  req.socket = io;
  if (whiteList.includes(req.path)) next();
  else {
    const token = req.headers.authorization;
    const decode = ConfirmToken(token);
    if (!decode) {
      return res.send({
        data: {},
        status: 401,
        message: "请先登录!",
      });
    } else next();
  }
});

// TODO: 加一个参数转义
app.use("/user", userRouter);
app.use("/article", articleRouter);
app.use("/message", messageRouter);
server.listen(3001, () => {
  console.log("running on 3001");
});
