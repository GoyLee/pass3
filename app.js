// app.js
const LocalStrategy = require('passport-local').Strategy;

module.exports = app => {
  // 注册策略/挂载strategy
  app.passport.use(new LocalStrategy({
    passReqToCallback: true,
  }, (req, username, password, done) => {
    // format user
    const user = {
      provider: 'local',
      username,
      password,
    };
    //debug('%s %s get user: %j', req.method, req.url, user);
    // console.log('___LOGIN_POST1: ' + JSON.stringify(user));
    app.passport.doVerify(req, user, done);
    //return done(null, user);
}));

// 验证用户信息
app.passport.verify(async (ctx, user) => {
    console.log('___LOGIN_POST2: ' + JSON.stringify(user));
    // 检查用户
    //assert(user.provider, 'user.provider should exists');
    //assert(user.id, 'user.id should exists');
    //ctx.login(user);
    ctx.session.type = ctx.request.body.type;
    //使用"工号"~code来验证，二不是username
    const existsUser = await ctx.model.Party.findOne({ code: user.username, password: user.password }); //从数据库中找出user
    if (existsUser) {
        //console.log('get path: ' + ctx.path)
        //指定 GET 成功登录信息ctx.body的地址
        //ctx.session.returnTo = '/api/login'; //ctx.path;
        ctx.session.login = 1;
        return existsUser;
        /*.username,
            status: 'ok',
            type: ctx.request.body.type,
            currentAuthority: existsUser.username === 'admin' ? 'admin' : 'user'
    };*/ //返回值被放入session，session被加密放入cookie
    } else { 
        ctx.session.login = 0;
        /*ctx.body = {
            username: user.username,
            status: 'error',
            type: ctx.request.body.type,
            currentAuthority: 'guest'
        };*/
        // 调用 model 注册新用户。打开注释可以用来新增用户！
        //const newUser = await new ctx.model.Party(user).save(function (err) { if (err) return console.error(err); });
        //return newUser;
        return null;
    }
    //return {id:'hello', ...user}; //样例直接返回.这里返回的user是个对象，ctx.user的内容自动赋值为user的内容，这里可以添加照片、id等信息。
     // 从数据库中查找用户信息
     //
     // Authorization Table
     // column   | desc
     // ---      | --
     // provider | provider name, like github, twitter, facebook, weibo and so on
     // uid      | provider unique id
     // user_id  | current application user id
     /*
     const auth = await ctx.model.Authorization.findOne({
       uid: user.id,
       provider: user.provider,
     });
     const existsUser = await ctx.model.User.findOne({ id: auth.user_id }); //从数据库中找出user
     if (existsUser) {
       return existsUser;
     }
     // 调用 service 注册新用户
     const newUser = await ctx.service.user.register(user);
     return newUser;
     */
  });

  //在调用 ctx.login() 时会触发序列化操作
  app.passport.serializeUser(async (ctx, user) => {
    //console.log('serializeParty: ', user)
    //done(null, user.id)
    // 处理 user
    // ...
    return user;
  });
  //在请求时，session中如果存在 "passport":{"user":"xxx"}时会触发定义的反序列化操作。
  app.passport.deserializeUser(async (ctx, user) => {
    //passport.deserializeParty(async function(id, done) {
    //    console.log('deserializeParty: ', id)
    //    var user = {id: 1, username: 'admin', password: '123456'}
    //    done(null, user)
    // 处理 user
    // ...
    return user;
  });
};

// 用户名密码验证策略
//passport.use(new LocalStrategy(
    /**
     * @param username 用户输入的用户名
     * @param password 用户输入的密码
     * @param done 验证验证完成后的回调函数，由passport调用
     */
/*
    function (username, password, done) {
        let where = { where: { username: username } }
        PartyModel.findOne(where).then(function (result) {
            if (result != null) {
                if (result.password == password) {
                    return done(null, result)
                } else {
                    return done(null, false, '密码错误')
                }
            } else {
                return done(null, false, '未知用户')
            }
        }).catch(function (err) {
            log.error(err.message)
            return done(null, false, { message: err.message })
        })
    }
))

// serializeParty 在用户登录验证成功以后将会把用户的数据存储到 session 中
passport.serializeParty(function (user, done) {
    done(null, user)
})

// deserializeParty 在每次请求的时候将从 session 中读取用户对象
passport.deserializeParty(function (user, done) {
    return done(null, user)
})

作者：宇帅
链接：https://www.jianshu.com/p/7010bea0c656
來源：简书
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。
*/