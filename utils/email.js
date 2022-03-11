//邮件发送
const nodemailer = require("nodemailer");
//qq:需要发送的对象
//html:需要发送的内容
//subject:标题
let sendMail = function (qq, html, subject, callBack) {
  let transporter = nodemailer.createTransport({
    service: "qq",
    port: 465, // SMTP 端口
    secureConnection: true, // 使用了 SSL
    auth: {
      user: "1559298665@qq.com",
      pass: "escsvblwornshdai",
    },
  });
  let mailOptions = {
    from: "校园助手 <1559298665@qq.com>", // 发件地址
    to: qq, // 收件列表
    subject: subject, // 标题
    html: html,
  };

  transporter.sendMail(mailOptions, function (error, response) {
    if (callBack) callBack(error, response);
    transporter.close(); // 如果没用，关闭连接池
  });
};
module.exports = sendMail;
