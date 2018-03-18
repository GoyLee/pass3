'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {

  async root() {
    const ctx = this.ctx;
    ctx.redirect('/home');
  }

  async login() {
    const ctx = this.ctx;
    console.log('__LOGIN_session: ' + JSON.stringify(ctx.session));
    //console.log('Current user: ' + JSON.stringify(ctx.user));
    if (ctx.session.login === 1) { //success
      ctx.body = {
      //username: user.username,
        status: 'ok',
        type: ctx.session.type,
        currentAuthority: ctx.user.username === 'admin' ? 'admin' : 'user'
      }
    } else { //login failed
      ctx.body = {
        status: 'error',
        type: ctx.session.type,
        currentAuthority: 'guest'
      }
    };
    // eggjs 登录时可以有ctx.csrf，作为安全措施之一！开关在config.default.js中
    //<form action="/login?_csrf=${ ctx.csrf }" method="post">
    /*ctx.body = `<div>
      <form action="/login" method="post">
        <div>
          <label>Username:</label>
          <input type="text" name="username" /><br/>
        </div>
        <div>
          <label>Password:</label>
          <input type="password" name="password" />
        </div>
        <div>
          <input type="submit" value="Submit" />
        </div>
      </form>
      <p><small>Hint - bob:secret</small></p>
      <p><small>Hint - joe:password</small></p>
    </div>`;
    */
  }

  async logout() {
    const ctx = this.ctx;
    ctx.session.login = 0;
    ctx.logout();
    console.log('___LOGOUT_session: ' + JSON.stringify(ctx.session));
    ctx.redirect(ctx.get('referer') || '/home');
  }

  async currentuser() {
    const ctx = this.ctx;
    //console.log('Current user2: ' + JSON.stringify(ctx.session));
    //TODO: 完善User库，存储和提供更多的用户信息
    if (ctx.isAuthenticated()) {
      ctx.body = {
        name: ctx.user.username,
        _id: ctx.user._id,
        pid: ctx.user.pid,
        avatar: 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png',
        userid: ctx.user.code,
        authority: ctx.user.authority || 'user',
        notifyCount: 18,
      }
    } else {
      //会让客户端进入登录界面
      ctx.response.status = 401; //'用户没有权限（令牌、用户名、密码错误）。'
    };
  }

  
  
  async render() {
    const ctx = this.ctx;
//ctx.user.id
    if (ctx.isAuthenticated()) {
      console.log('PASSED: ' + ctx.user);
      ctx.body = `<div>
        <h2>${ctx.path}</h2>
        <hr>
        Logined user: <img src="${ctx.user.photo}"> ${ctx.user.username} / ${ctx.user._id} | <a href="/logout">Logout</a>
        <pre><code>${JSON.stringify(ctx.user, null, 2)}</code></pre>
        <hr>
        <a href="/">Home</a> | <a href="/user">User</a>
      </div>`;
    } else {
      ctx.response.status = 401; //'用户没有权限（令牌、用户名、密码错误）。'
      ctx.session.returnTo = ctx.path; //设定下次成功后自动跳转回本api
      ctx.body = `
        <div>
          <h2>${ctx.path}</h2>
          <hr>
          <p>Please login first!</p>
          Login with: 
          <a href="/login">LOGIN</a>
          <p/>
          <a href="/passport/weibo">Weibo</a> | <a href="/passport/github">Github</a> |
          <a href="/passport/bitbucket">Bitbucket</a> | <a href="/passport/twitter">Twitter</a>
          <hr>
          <a href="/">Home</a> | <a href="/user">User</a>
        </div>
      `;
    }
  }
}

module.exports = HomeController;
