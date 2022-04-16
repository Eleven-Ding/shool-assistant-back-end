const express = require("express");
const articleRouter = express.Router();
const sendMail = require("../utils/email");
const { randomCounter } = require("../utils/common");
const connection = require("../utils/db");
const { SignToken, ConfirmToken } = require("../utils/authentication");
const dayjs = require("dayjs");

articleRouter.post("/add_article", async (req, res) => {
  const { tag = "", content = "", urls = [], position = "中国" } = req.body;
  const token = req.headers.authorization;
  const {
    userInfo: { email },
  } = ConfirmToken(token);
  try {
    const result = await connection(
      `insert into articles (content,urls,position,tag,userEmail,createTime)values('${content}','${urls.toString()}','${
        position || ""
      }','${tag}','${email}','${Date.now()}')`
    );
    return res.send({
      data: { result },
      status: 200,
      message: "发布成功",
    });
  } catch (err) {
    return res.send({
      data: { err },
      status: 500,
      message: "发布失败",
    });
  }
});
articleRouter.get("/get_articles", async (req, res) => {
  let { limit, page } = req.query;
  const { username } = ConfirmToken(req.headers.authorization);
  page = (page - 1) * limit;
  const result = await connection(
    `select * from articles  order by article_id desc  LIMIT ${parseInt(
      page
    )},${parseInt(limit)} `
  );

  for (let i = 0; i < result.length; i++) {
    const item = result[i];
    const p = await connection(
      `select avator,username,email,school_name from users where  email='${item.userEmail}' `
    );
    item.avator = p[0].avator;
    item.username = p[0].username;
    item.school_name = p[0].school_name;
    item.email = p[0].email;
    item.createTime = dayjs(Number(item.createTime)).format(
      "YYYY-MM-DD HH:mm:ss"
    );
  }

  result.forEach(async (item, index) => {});
  return res.send({
    data: {
      articles: result,
    },
    status: 200,
    message: "查询成功",
  });
});

articleRouter.post("/change_view", async (req, res) => {
  const { article_id } = req.body;
  const result = await connection(
    `update articles set views=views+1 where article_id=${article_id}`
  );
  return res.send({
    data: { result },
    status: 200,
    message: "",
  });
});

articleRouter.post("/add_comment", async (req, res) => {
  const token = req.headers.authorization;
  const { userInfo } = ConfirmToken(token);
  const {
    content,
    article_id,
    position = "中国",
    father_id = -1,
    level_id = -1,
  } = req.body;
  const { id } = userInfo;
  const result = await connection(
    `insert into comment (content,article_id,user_id,position,father_id,create_time,level_id)
    values('${content}',${article_id},${id},'${position}',${father_id},'${Date.now()}',${level_id})`
  );

  return res.send({
    data: {
      result,
    },
    status: 200,
    message: "",
  });
});

articleRouter.get("/get_comment", async (req, res) => {
  const { article_id } = req.query;
  const result = await connection(
    `select * from comment where article_id=${article_id}`
  );
  for (let i = 0; i < result.length; i++) {
    const item = result[i];
    const p = await connection(`select * from users where id=${item.user_id}`);
    item.userInfo = p[0];
    item.userInfo.password = "******";
    item.create_time = dayjs(Number(item.create_time)).format(
      "YYYY-MM-DD HH:mm:ss"
    );
  }
  //筛选出father_id =-1的
  const father = result.filter(
    (item) => item.father_id === -1 && item.level_id === -1
  );
  const child = result.filter((item) => item.father_id !== -1);

  for (let i = 0; i < child.length; i++) {
    const p = await connection(
      `select username from users where id=${child[i].father_id}`
    );
    child[i].father_name = p[0].username;
  }
  for (let i = 0; i < father.length; i++) {
    father[i].children = [];
    for (let j = 0; j < child.length; j++) {
      if (child[j].level_id === father[i].comment_id) {
        father[i].children.push(child[j]);
      }
    }
  }
  return res.send({
    data: {
      comments: father,
    },
    status: 200,
    message: "",
  });
});

articleRouter.get("/get_article", async (req, res) => {
  const { article_id } = req.query;
  const result = await connection(
    `select * from articles where article_id=${article_id}`
  );
  if (!result[0]) {
    return res.send({
      data: {
        result: {},
      },
      status: 401,
      message: "",
    });
  }
  const item = result[0];
  const p = await connection(
    `select avator,username,email,school_name,id from users  where email='${item.userEmail}' `
  );
  item.avator = p[0].avator;
  item.username = p[0].username;
  item.school_name = p[0].school_name;
  item.email = p[0].email;
  item.createTime = dayjs(Number(item.createTime)).format(
    "YYYY-MM-DD HH:mm:ss"
  );
  item.userId = p[0].id;
  return res.send({
    data: {
      result: result[0],
    },
    status: 200,
    message: "",
  });
});
articleRouter.post("/add_browser", async (req, res) => {
  const { article_id } = req.body;
  const {
    userInfo: { id },
  } = ConfirmToken(req.headers.authorization);
  await connection(
    `insert into browser(article_id,user_id)values(${article_id},${id})`
  );
  return res.send({
    data: {},
    message: "",
    status: 200,
  });
});
articleRouter.post("/delete_article", async (req, res) => {
  const { article_id } = req.body;
  const {
    userInfo: { id },
  } = ConfirmToken(req.headers.authorization);
  const [{ username, email }] = await connection(
    `select * from users where id=${id}`
  );

  const result = await connection(
    `delete from articles where userEmail='${email}' and article_id=${article_id}`
  );
  console.log(result);
  if (result.affectedRows) {
    return res.send({
      data: {},
      message: "删除成功",
      status: 200,
    });
  }
  return res.send({
    data: {},
    message: "只能删除自己的",
    status: 403,
  });
});

articleRouter.get("/get_all_artile", async (req, res) => {
  const result = await connection(`select * from articles`);
  return res.send({
    data: {
      articles: result,
      message: "获取成功",
      status: 200,
    },
  });
});
articleRouter.get("/get_all_comment", async (req, res) => {
  const result = await connection(`select * from comment`);
  for (let i = 0; i < result.length; i++) {
    const item = result[i];
    const p = await connection(`select * from users where id=${item.user_id}`);
    item.userInfo = p[0];
    item.userInfo.password = "******";
    item.create_time = dayjs(Number(item.create_time)).format(
      "YYYY-MM-DD HH:mm:ss"
    );
  }

  return res.send({
    data: {
      comments: result,
    },
    status: 200,
    message: "",
  });
});

articleRouter.post("/delete_comment", async (req, res) => {
  const { comment_id } = req.body;
  const result = await connection(
    `delete from comment where comment_id=${comment_id}`
  );
  return res.send({ data: {}, message: "", status: 200 });
});

module.exports = articleRouter;
