const express = require("express");
const userRouter = express.Router();
const sendMail = require("../utils/email");
const { randomCounter } = require("../utils/common");
const { emailHtml, basicColumns } = require("../constant");
const connection = require("../utils/db");
const { SignToken, ConfirmToken } = require("../utils/authentication");

//注册
userRouter.post("/register", async (req, res) => {
  const { email, code, username, password, school } = req.body;
  const avator = `https://q.qlogo.cn/headimg_dl?dst_uin=${
    email?.split("@")[0]
  }&spec=100`;
  const result = await connection(
    `select * from code where code='${code}' and email='${email}'`
  );
  if (result.length > 0) {
    //查询该邮箱是否注册过了
    const registed = await connection(
      `select * from users where email='${email}'`
    );
    if (registed.length > 0) {
      return res.send({
        data: {},
        status: 401,
        message: "您已经注册过了!",
      });
    }
    await connection(
      `insert into users (username,password,email,avator,school_name,create_time)values('${username}','${password}','${email}','${avator}','${
        basicColumns[school]
      }','${Date.now()}') `
    );
    //注册成功后删除code
    await connection(`delete from code where email='${email}'`);
    return res.send({
      data: {},
      status: 200,
      message: "注册成功!",
    });
  }

  return res.send({
    data: {},
    status: 401,
    message: "验证码无效！",
  });
});

//登录
// TODO: 记得做socket相关的东西
userRouter.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const result = await connection(
    `select * from users where username='${username}' or email='${username}' and password = '${password}'`
  );
  // 进行soketId的变成
  if (result.length) {
    const token = SignToken({
      username,
      time: Date.now(),
      tips: "你在瞎解析什么呢？",
      userInfo: result[0],
    });
    return res.send({
      data: {
        token,
        userId: result[0].id,
      },
      status: 200,
      message: "登录成功",
    });
  }
  return res.send({
    data: {},
    status: 401,
    message: "密码错误",
  });
});

userRouter.post("/email", async (req, res) => {
  const { email } = req.body;
  await connection(`delete from code where email='${email}'`);
  const code = randomCounter();
  sendMail(
    email,
    emailHtml(code),
    `校园助手注册验证码<${code}>`,
    async (err, response) => {
      // 插入验证码
      await connection(
        `insert into code (code,email)values('${code}','${email}')`
      );
      res.send({
        data: {},
        status: 200,
        message: "验证码发送成功",
      });
    }
  );
});

userRouter.get("/getUserInfo", async (req, res) => {
  // console.log(req.socket.emit);
  const token = req.headers.authorization;
  const decode = ConfirmToken(token);
  const { username } = decode;
  const result = await connection(
    `select * from users where email='${username}' or username='${username}'`
  );
  result[0].password = "******";
  result[0].socket_id = "******";

  return res.send({
    data: {
      userInfo: result[0],
    },
    status: 200,
    message: "",
  });
});

userRouter.get("/create_connect", (req, res) => {
  //
  const socketId = req.socket.id;
  const token = req.headers.authorization;
  const { username } = ConfirmToken(token);
  const result = connection(`update users set soketId`);

  return res.send({});
});
module.exports = userRouter;
