const express = require("express");
const articleRouter = express.Router();
const sendMail = require("../utils/email");
const { randomCounter } = require("../utils/common");
const connection = require("../utils/db");
const { SignToken, ConfirmToken } = require("../utils/authentication");

articleRouter.post("/add_article", async (req, res) => {
  const { tag = "", content = "", urls = [], position = "中国" } = req.body;
  const token = req.headers.authorization;
  const { username } = ConfirmToken(token);
  try {
    const result = await connection(
      `insert into articles (content,urls,position,tag,userEmail,createTime)values('${content}','${urls.toString()}','${position}','${tag}','${username}','${Date.now()}')`
    );
    return res.send({
      data: { result },
      status: 200,
      message: "发布成功",
    });
  } catch (err) {
    console.log(err);
    return res.send({
      data: { err },
      status: 500,
      message: "发布失败",
    });
  }
});
module.exports = articleRouter;
