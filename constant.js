// TODO:  这里把链接和文本描述改一下
const emailHtml = function (code) {
  return `<div style="background-color: #f2f5f8; display: flex; justify-content: center; align-items: center;">
    <div
        style="background-color: #fff;border-radius: 4px;box-sizing: border-box;box-shadow: 0 0 5px rgba(0, 0, 0, .2); padding: 10px; margin: 10px;">
        <div
            style="display: flex;height: 40px; line-height: 40px; justify-content: space-between; border-bottom: 2px dashed #86bef9;">
            <div style="margin: 5px 15px; font-weight: bold; color: #2d8cf0;"> <img
                    src="http://thirdqq.qlogo.cn/g?b=oidb&k=NZdmFLJYFTxyKicibXNeoOpA&s=100&t=1589502963" style="width: 25px; height: 25px;" alt=""> DingShiYi的个人博客 </div> <a href="http://www.shyding.xyz"
                style="color: #2d8cf0; display: inline; margin: 5px 15px; text-decoration: none;"
                target="_blank">首页</a>
        </div>
        <div style="text-align: center;">
            <h2 style="font-size: 30px; font-weight: 400; margin: 10px auto;"> <span
                    style="color: #2d8cf0; font-size: 30px; font-weight: 400;">DingShiYi的个人博客</span> -- 后台管理登录验证码! </h2>

            <p style="color: #444; font-size: 17px; margin: 20px auto;">验证码:<span
                    style="color: #2d8cf0; font-size: 17px; margin: 20px auto;">${code}</span></p>
                    <p style="color: #444; font-size: 17px; margin: 20px auto;">有效时间:<span
                    style="color: #2d8cf0; font-size: 17px; margin: 20px auto;">10分钟</span></p>
        </div>
        <div style="text-align: center; border-top: 1px dashed #eee;">
            <p style="margin: 20px auto 15px; font-size: 10px; color: #999;">此为系统自动发送邮件, 请勿直接回复.版权所有 @shyding个人博客
            </p>
        </div>
    </div>
</div>`;
};

const basicColumns = [
  "",
  "西华大学",
  "电子科技大学",
  "西南财经大学",
  "西南交通大学",
  "四川大学",
];

module.exports = {
  basicColumns,
  emailHtml,
};
