//2018-2-24 by MYY.
//mongodb脚本，为ant design + egg + mongodb应用建立初始的管理员账号
//安装mongodb，并设好path环境变量后，命令行执行如下命令：
//mongo initMongoDB.js

conn = new Mongo();
db = conn.getDB("test");
db.createCollection('parties');
db.createCollection('parties');
db.parties.insertOne( { username: 'admin', password:'888888' });
// db.createCollection('users');
// db.users.insertOne( { username: 'admin', password:'888888', createdAt: Date.now() });
// db.users.insertOne( { username: 'user', password:'123456', createdAt: Date.now() });

