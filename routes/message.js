const express = require("express");
const messageRouter = express.Router();
const sendMail = require("../utils/email");
const { randomCounter } = require("../utils/common");
const connection = require("../utils/db");
const { SignToken, ConfirmToken } = require("../utils/authentication");
const dayjs = require("dayjs");

messageRouter.get("/get_all_messages", async (req, res) => {
  const token = req.headers.authorization;
  const {
    userInfo: { id },
  } = ConfirmToken(token);
  const result = await connection(
    `select * from messages where from_id=${id} or to_id=${id} order by createTime`
  );
  const ids = {};
  for (let i = 0; i < result.length; i++) {
    const item = result[i];
    item.createTime = dayjs(Number(item.createTime)).format(
      "YYYY-MM-DD HH:mm:ss"
    );
    const { from_id, to_id } = item;
    if (!ids[from_id]) {
      const result = await connection(
        `select avator,id,school_name,username from users where id=${from_id}`
      );
      ids[from_id] = result[0];
    }
    if (!ids[to_id]) {
      const result = await connection(
        `select avator,id,school_name,username from users where id=${to_id}`
      );
      ids[to_id] = result[0];
    }
  }
  for (let i = 0; i < result.length; i++) {
    const item = result[i];
    item.formUser = ids[item.from_id];
    item.toUser = ids[item.to_id];
  }
  // 分组 让前端好处理
  const arr = Object.entries(ids).filter((item) => {
    return item[0] != id;
  });

  const messageMap = [];

  for (let i = 0; i < arr.length; i++) {
    const [id, toUserInfo] = arr[i];
    messageMap.push({
      id,
      toUserInfo,
      arr: result.filter((item) => {
        return item.from_id == id || item.to_id == id;
      }),
    });
  }

  return res.send({
    data: { messageMap },
    status: 200,
    message: "",
  });
});

messageRouter.post("/update_message", async (req, res) => {
  const token = req.headers.authorization;
  const {
    userInfo: { id },
  } = ConfirmToken(token);
  const { userId } = req.body;
  await connection(
    `update  messages set isRead=1 where from_id=${userId} and to_id=${id}`
  );
  return res.send({
    data: {},
    status: 200,
    message: "",
  });
});

module.exports = messageRouter;
