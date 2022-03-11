const express = require("express");
const app = express();
const userRouter = require("./routes/user");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
require("express-async-errors");
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
// TODO: 加一个参数转义
app.use("/user", userRouter);
app.use((err, _, res, next) => {
  if (err) {
    res.status(err.status || 500);
    res.send({
      code: 500,
      data: err,
      message: error.message,
    });
  }

  next(err);
});
app.listen(3000, () => {
  console.log("running on 3001");
});
