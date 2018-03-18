'use strict';

// secure keys on https://github.com/eggjs/egg/wiki#secure-env-for-travis-ci
exports.passportWeibo = {
  key: 'a',
  secret: 'b',
};

exports.passportGithub = {
  key: 'c',
  secret: 'd',
};

exports.passportBitbucket = {
  key: 'e',
  secret: 'f',
};

exports.passportTwitter = {
  key: 'g',
  secret: 'h',
};

//样例原文件有误，下面这段添加后即可使用了，
module.exports = appInfo => {
  const config = exports; //= {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1515390682898_6892';

  config.security = {
    csrf: false, //关闭了安全检查
    ctoken: false, 
  };
  // add your config here
  config.middleware = [];

  config.mongoose = {
    url: 'mongodb://localhost:27017/test',
    // url: 'mongodb://10.50.1.250:27017/test',
    options: {}
  };

  return config;
};