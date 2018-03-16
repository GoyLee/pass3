//2018-2-24 by MYY.
//mongodb脚本，为ant design + egg + mongodb应用建立初始的管理员账号
//安装mongodb，并设好path环境变量后，命令行执行如下命令：
//C:\Program Files\MongoDB\Server\3.6\bin\mongo initMongoDB.js
//mongo 10.50.1.250 initMongoDB.js

conn = new Mongo();
// conn = new Mongo("10.50.1.250");
db = conn.getDB("test");
db.createCollection('parties');
db.parties.insertOne( { code: 'admin', username: 'admin', password:'888888', authority:'admin', type:'员工', status:'正常', createdAt: Date.now() });
db.parties.insertOne( { code: '2', username: '型号', type:'标签', status:'正常', createdAt: Date.now() });
db.parties.insertOne( { code: '6', username: '信息化项目群', type:'标签', status:'正常', createdAt: Date.now() });
db.parties.insertOne( { code: '9', username: '公司信息化项目群', type:'标签', status:'正常', createdAt: Date.now() });
db.parties.insertOne( { code: '7', username: '设备', type:'标签', status:'正常', createdAt: Date.now() });
db.parties.insertOne( { code: '8', username: '软件', type:'标签', status:'正常', createdAt: Date.now() });
// db.createCollection('users');
// db.users.insertOne( { username: 'admin', password:'888888', createdAt: Date.now() });
// db.users.insertOne( { username: 'user', password:'123456', createdAt: Date.now() });

