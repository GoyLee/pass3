'use strict';

module.exports = app => {
  const { router, controller } = app;
  //app.passport.mount('weibo');
  //app.passport.mount('github');
  //app.passport.mount('bitbucket');
  //app.passport.mount('twitter');
  app.router.get('/', controller.home.root); 
  //next 3 lines is for 'local' strategy
  // 鉴权成功后的回调页面
  //app.router.get('/authCallback', controller.home.authCallback);//authcallback是登录成功后的页面。controller：Egg的标准用法：router没有ctx！，不能直接渲染ctx.body, 也就不能直接response
  app.router.get('/home', controller.home.render); //egg-passport必须到controller中去检查是否认证过，无法统一认证？也就说默认就是对每个api要单独认证？
  // 登录校验
  //'/login'时使用 passport.authenticate('策略', ...) ，会执行在app中注册的‘策略’的Verify()
  app.router.post('/login', app.passport.authenticate('local',{ successRedirect: '/api/login', failureRedirect: '/api/login' })); //,{loginURL: '/api/login'})); //, { successRedirect: '/home', failureRedirect: '/home' })); //TODO: 认证失败的跳转地址如何设？
  //app.router.post('/login', app.passport.authenticate('local', { successRedirect: '/authCallback' }));
  // 渲染登录页面，用户输入账号密码
  app.router.get('/login', controller.home.login);
  app.router.get('/currentUser', controller.home.currentuser);
  //logout 在user.logout中！！！
  app.router.get('/logout', 'home.logout');

  //对party的请求
  app.router.get('/dept', controller.party.getDept);
  app.router.get('/party', controller.party.getParty);
  app.router.post('/party', controller.party.postParty);

  //对requirement的请求
  //app.router.get('/reqtree', controller.party.getReqTree);
  app.router.get('/requirement', controller.requirement.getRequirement);
  app.router.post('/requirement', controller.requirement.postRequirement);
  
  /*
  app.router.get('/logout', ctx => {
    ctx.body = {auth: ctx.isAuthenticated(), user: ctx.user} //ctx.user - 获取当前已登录的用户信息
    ctx.logout()
  });
  app.router.get('/test', (ctx) => {
    if(app.controller.ctx.isAuthenticated()) {
      app.controller.ctx.body = 'Hello World!'
    } else {
      app.controller.ctx.status = 401
      app.controller.ctx.body = {
       msg: 'auth fail'
     }
   }
  });
  */
  
  /*
  //路由守护中间件, 这里是/api/*的路由需要用户认证才能访问
  app.router.use('/*', (ctx, next) => { //本条之前的全部被拦截！之后的不被拦截！所以login和默认页的代码应该放本条之后！
    if(ctx.isAuthenticated()) {
      next()
    } else {
     ctx.status = 401
     ctx.body = {
       msg: 'auth fail'
     }
   }
  })
  */
  //app.router.get('/user', 'home.render');

};

