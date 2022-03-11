//对象存储有关的

const COS = require("cos-nodejs-sdk-v5");
const COS_SECRETID = "AKIDd1JRJBnBcshJflm71WkzsVTAaliP2nAH";
const COS_SECRETKEY = "zdwzmJNKZZGiuhgQ3YonZ3HGfRxRfB5P";
const cos = new COS({
  SecretId: COS_SECRETID,
  SecretKey: COS_SECRETKEY,
});

function objectStorage(Bucket, Region, Key, Body, callBack) {
  cos.putObject(
    {
      Bucket: Bucket /* 必须 */,
      Region: Region /* 必须 */,
      Key: Key /* 必须 */,
      StorageClass: "STANDARD",
      // contentType:'image/jpeg',
      Body: Body.buffer, // 上传文件对象
    },
    function (err, data) {
      callBack(err, data);
    }
  );
}

module.exports = objectStorage;
