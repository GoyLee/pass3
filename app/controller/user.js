'use strict';

const Controller = require('egg').Controller;

class UserController extends Controller {

  // app/controller/user.js

  //index = async (ctx) => {
  //  ctx.body = await ctx.model.User.find({});  // you should use upper case to access mongoose model
  //}

  async getuser() {
    const ctx = this.ctx;
    //TODO: 提供异常和错误处理
    if (ctx.isAuthenticated()) {
      try{
        //var product = await ProductCol.find({_id: id}) // find a doc; 这里必须用await来同步，因mongoose's CRUD函数返回的都是Promise！
        const User = await ctx.model.User.find({}).sort('-updatedAt'); //从数据库中找出user
        //console.log(User);
        const result = {
          list: User,
          pagination: {
            total: User.length,
            pageSize: 10,
            current: 1,
            //current: parseInt(params.currentPage, 10) || 1,
          },
        }  
        ctx.body = result;
        //console.log('BODY:' + JSON.stringify(ctx.body));
      } catch (e) {
        console.log(`###error ${e}`)
        ctx.body = 'Data not found -myy';
        //throw e
      }
    } else {
    //  ctx.response.status = 401; //'用户没有权限（令牌、用户名、密码错误）。会导致antPro客户端重新登录'
      ctx.body = '404 not found-myy';
    };
  }

  async postuser() {
    const ctx = this.ctx;
    //TODO: 提供异常和错误处理
    if (ctx.isAuthenticated()) {
      try{
        var user = ctx.request.body;
        //{method} = user;
        switch (user.method) {
          case 'post':
            //user = {...user, createdAt: Date.now() };
            console.log('To add: ' + JSON.stringify(user));
            const newUser = await new ctx.model.User(user).save(); //function (err) { if (err) return console.error(err); }
            break;
          case 'delete':
            //console.log('To delete: ' + JSON.stringify(user).id);
            var ids = user.id.split(",");
            console.log('To delete: ' + ids);
            //var ObjectID = ctx.app.mongoose.Schema.Types.ObjectId;
            //var id = new ObjectID;
            var ids = user.id.split(",");
            //ids.map( id => ctx.model.User.remove({_id: id})); //err => { if (err) return console.log(err); })); 
            //findByIdAndRemove() executes immediately if callback is passed, else a Query object is returned!!
            //ids.map( id => ctx.model.User.findByIdAndRemove(id, err => { if (err) return console.log(err); })); 
            // async pro(id) { await ctx.model.User.findByIdAndRemove(id);}
            ids.map( async (id) => await ctx.model.User.findByIdAndRemove(id) ); // 注意map，async 和 await的配合！
            break;
          default:
            break;
        };
        const Users = await ctx.model.User.find({}).sort('-updatedAt'); //从数据库中找出user
        //console.log(User);
        const result = {
          list: Users,
          pagination: {
            total: Users.length,
            pageSize: 10,
            current: 1,
            //current: parseInt(params.currentPage, 10) || 1,
          },
        }  
        ctx.body = result;
        //ctx.body = newUser; //'Data added -myy';
      } catch (e) {
        console.log(`###error ${e}`)
        ctx.body = 'Add failed -myy';
        //throw e
      }
    } else {
      //  ctx.response.status = 401; //'用户没有权限（令牌、用户名、密码错误）。会导致antPro客户端重新登录'
        ctx.body = '404 not found-myy';
    };
  };
};

module.exports = UserController;
