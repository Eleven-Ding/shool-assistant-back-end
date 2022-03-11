const randomCounter = () => {
  // N为验证码的位数
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += Math.floor(Math.random() * 10); //可均衡获取0到9的随机整数。;
  }
  return code;
};

module.exports = {
  randomCounter,
};
