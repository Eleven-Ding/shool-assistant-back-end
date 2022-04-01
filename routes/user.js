const express = require("express");
const userRouter = express.Router();
const sendMail = require("../utils/email");
const { randomCounter } = require("../utils/common");
const { emailHtml, basicColumns } = require("../constant");
const connection = require("../utils/db");
const { SignToken, ConfirmToken } = require("../utils/authentication");
const dayjs = require("dayjs");
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
      `select * from users where email='${email}' or username='${username}'`
    );
    if (registed.length > 0) {
      return res.send({
        data: {},
        status: 401,
        message: "邮箱或者用户名已被使用!",
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
      username: result[0].username,
      email: result[0].email,
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
  const token = req.headers.authorization;
  const decode = ConfirmToken(token);
  const {
    userInfo: { id, email },
  } = decode;
  const result = await connection(`select * from users where id=${id}`);
  result[0].password = "******";
  result[0].socket_id = "******";

  const articles = await connection(
    `select * from articles where userEmail='${email}'`
  );
  for (let i = 0; i < articles.length; i++) {
    articles[i].createTime = dayjs(Number(articles[i].createTime)).format(
      "YYYY-MM-DD HH:mm:ss"
    );
    const { userEmail } = articles[i];
    // const [userInfo] = await connection(
    //   `select avator,username,id from users where username='${userEmail}' or email='${userEmail}'`
    // );
    // articles[i].userInfo = userInfo;
  }
  let ids = [];
  let browsers = [];
  const browser = await connection(
    `select * from browser where user_id=${result[0].id}`
  );
  for (let i = 0; i < browser.length; i++) {
    const { article_id } = browser[i];
    if (!ids.includes(article_id)) {
      ids.push(article_id);
      const [result] = await connection(
        `select * from articles where article_id=${article_id}`
      );
      if (result) {
        result.createTime = dayjs(Number(result.createTime)).format(
          "YYYY-MM-DD HH:mm:ss"
        );
        browsers.push(result);
      }
    }
  }
  const follow = await connection(`select * from follow where from_id=${id}`);
  const befollow = await connection(`select * from follow where to_id=${id}`);
  for (let i = 0; i < befollow.length; i++) {
    const item = befollow[i];
    const { from_id } = item;
    const result = await connection(
      `select avator,username,id from users where id=${from_id}`
    );
    item.userInfo = result[0];
  }
  for (let i = 0; i < follow.length; i++) {
    const item = follow[i];
    const { to_id } = item;
    const result = await connection(
      `select avator,username,id from users where id=${to_id}`
    );
    item.userInfo = result[0];
  }
  return res.send({
    data: {
      userInfo: result[0],
      articles,
      browsers,
      follow,
      befollow,
    },
    status: 200,
    message: "",
  });
});

userRouter.get("/getOtherInfo", async (req, res) => {
  const { id } = req.query;
  const result = await connection(`select * from users where id=${id}`);
  result[0].password = "******";
  result[0].socket_id = "******";
  const { email } = result[0];
  const articles = await connection(
    `select * from articles where userEmail='${email}'`
  );
  for (let i = 0; i < articles.length; i++) {
    articles[i].createTime = dayjs(Number(articles[i].createTime)).format(
      "YYYY-MM-DD HH:mm:ss"
    );
    const { userEmail } = articles[i];
    const [userInfo] = await connection(
      `select avator,username,id from users where  email='${userEmail}'`
    );
    articles[i].userInfo = userInfo;
  }
  // 获取浏览记录
  let ids = [];
  let browsers = [];
  const browser = await connection(`select * from browser where user_id=${id}`);
  for (let i = 0; i < browser.length; i++) {
    const { article_id } = browser[i];
    if (!ids.includes(article_id)) {
      ids.push(article_id);
      const [result] = await connection(
        `select * from articles where article_id=${article_id}`
      );
      if (result) {
        result.createTime = dayjs(Number(result.createTime)).format(
          "YYYY-MM-DD HH:mm:ss"
        );
        browsers.push(result);
      }
    }
  }
  const follow = await connection(`select * from follow where from_id=${id}`);
  const befollow = await connection(`select * from follow where to_id=${id}`);
  return res.send({
    data: {
      userInfo: result[0],
      articles,
      browsers,
      follow,
      befollow,
    },
    status: 200,
    message: "",
  });
});
userRouter.post("/update_user", async (req, res) => {
  const token = req.headers.authorization;
  const decode = ConfirmToken(token);
  const userInfo = decode.userInfo;
  const { email: userEmail } = userInfo;
  const { username, avator, email } = req.body;
  if (email !== userEmail) {
    return res.send({
      data: {},
      message: "身份不匹配",
      status: 401,
    });
  }
  await connection(
    `update users set username='${username}', avator='${avator}' where email='${email}'`
  );
  decode.userInfo.username = username;
  decode.username = username;
  decode.userInfo.avator = avator;
  const token1 = SignToken(decode);
  return res.send({
    data: {
      token: token1,
    },
    message: "修改成功",
    status: 200,
  });
});

userRouter.post("/add_follow", async (req, res) => {
  const { userId } = req.body;
  const {
    userInfo: { id },
  } = ConfirmToken(req.headers.authorization);
  const result = await connection(
    `select * from follow where from_id=${id} and to_id=${userId}`
  );
  if (result.length) {
    return res.send({
      data: {},
      message: "您已经关注过了",
      status: 201,
    });
  }
  await connection(`insert into follow(from_id,to_id)values(${id},${userId})`);
  return res.send({
    data: {},
    message: "关注成功",
    status: 200,
  });
});
module.exports = userRouter;
