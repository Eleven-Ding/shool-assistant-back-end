const jwt = require("jsonwebtoken");

//加密的码
const secret = "shyding";

//生成token
const SignToken = function (email) {
  let token = jwt.sign(email, secret);
  //返回token
  return token;
};

//验证token
const ConfirmToken = function (token) {
  let obj = null;
  jwt.verify(token, secret, function (err, decode) {
    if (err) {
      return {};
    }
    obj = decode;
  });
  return obj;
};

module.exports = {
  ConfirmToken,
  SignToken,
};
