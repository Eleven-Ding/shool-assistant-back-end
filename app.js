const express = require("express");
const app = express();
const userRouter = require("./routes/user");
const articleRouter = require("./routes/articles");
const bodyParser = require("body-parser");
const { ConfirmToken } = require("./utils/authentication");
var server = require("http").createServer(app);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
require("express-async-errors");
const io = require("socket.io")(server, {
  cors: true,
});

io.on("connection", function (socket) {
  console.log("a user connected");

  socket.on("disconnect", function () {
    console.log("a user go out");
  });

  // io.to(socketId).emit("add",data)
  socket.on("message", function (obj) {
    //延迟3s返回信息给客户端
    setTimeout(function () {
      io.emit("message", obj);
    }, 3000);
  });
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

server.listen(3001, () => {
  console.log("running on 3001");
});
