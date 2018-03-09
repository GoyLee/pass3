'use strict';
// const getUrlParams = require('../public/getParams')
const Controller = require('egg').Controller;

class ImplementController extends Controller {
  // app/controller/implement.js
  //返回Implement列表
  async getImplement() {
    const ctx = this.ctx;
    if (ctx.isAuthenticated()) {
      try{
        console.log('___QUERY:' + JSON.stringify(ctx.query));
        var where = {};
        //where因koa\egg的ctx.query不能解析嵌套对象，只能是按业务逐表定制
        if (ctx.query.pid) {
          //console.log('___QUERY:' + ctx.query.selectedDept);
          where = {...where, pid: ctx.query.pid }
        }
        if (ctx.query.status) {
          //console.log('___QUERY:' + ctx.query.selectedDept);
          where = {...where, status: ctx.query.status }
        }
        if (ctx.query.name) {
          //console.log('___QUERY:' + ctx.query.selectedDept);
          const reg = new RegExp(ctx.query.name, 'i');
          where = {...where, name: {$regex : reg}}
        }
        // let pageSize = parseInt(ctx.query.pageSize) || 10;
        // let current = parseInt(ctx.query.currentPage) || 1;
        let sorter = ctx.query.sorter || '-createdAt';
        //if (ctx.query.pageSize) {
        //  pageSize = ctx.query.pageSize * 1;
        //}
        //const params = getUrlParams(ctx.request.href);
        // you should use upper case to access mongoose model
        //var product = await ProductCol.find({_id: id}) // find a doc; 这里必须用await来同步，因mongoose's CRUD函数返回的都是Promise
        // const count = await ctx.model.Implement.find(where).count();
        const Implements = await ctx.model.Implement.find(where).sort(sorter); //.skip((current-1) * pageSize).limit(pageSize); //从数据库中找出Implement
        //console.log(Implement);
        const result = Implements; //M: 要返回列表，不要返回对象
        ctx.body = result;
        ctx.status = 200;
        console.log('___GETREQ:' + JSON.stringify(ctx.body));
      } catch (e) {
        console.log(`###error ${e}`)
        ctx.body = 'Data not found';
        ctx.status = 500;
        //throw e
      }
    } else {
      ctx.response.status = 401; //'用户没有权限（令牌、用户名、密码错误）。会导致antPro客户端重新登录'
      ctx.body = '404 not found-myy';
      //ctx.status = 401;
    };
  }

  async postImplement() {
    const ctx = this.ctx;
    if (ctx.isAuthenticated()) {
      try{
        var implement = ctx.request.body;
        //{method} = implement;
        switch (implement.method) {
          case 'post':
            //implement = {...implement, createdAt: Date.now() };
            console.log('ADD:' + JSON.stringify(implement));
            const newImplement = await new ctx.model.Implement(implement).save(); //function (err) { if (err) return console.error(err); }
            var id = newImplement._id;
            ctx.status = 201;
            break;
          case 'update':
            console.log('UPDATE:' + JSON.stringify(implement));
            // implement = {...implement, updatedAt: Date.now()};
            const oldImplement = await ctx.model.Implement.findByIdAndUpdate(implement._id, implement); //function (err) { if (err) return console.error(err); }
            var id = implement._id;
            ctx.status = 201;
            break;
          case 'delete':
            //console.log('To delete: ' + JSON.stringify(implement).id);
            var ids = implement.id.split(",");
            console.log('DELETE:' + ids);
            //var ObjectID = ctx.app.mongoose.Schema.Types.ObjectId;
            //var id = new ObjectID;
            //ids.map( id => ctx.model.Implement.remove({_id: id})); //err => { if (err) return console.log(err); })); 
            //findByIdAndRemove() executes immediately if callback is passed, else a Query object is returned!!
            //ids.map( id => ctx.model.Implement.findByIdAndRemove(id, err => { if (err) return console.log(err); })); 
            // async pro(id) { await ctx.model.Implement.findByIdAndRemove(id);}
            ids.map( async (id) => await ctx.model.Implement.findByIdAndRemove(id) ); // 注意map，async 和 await的配合！
            var id = ids[0];
            ctx.status = 204;
            break;
          default:
            break;
        };
        //保存一条“事件”：
        const i = await ctx.model.Implement.findOne({_id: id}).populate('tags', 'username'); // only return the Party's name
        const event = {user: i.user, pid: i.pid, sid: i._id, status: '计划',
                name: i.budgetyear + '年落实：[' + i.name
                +'] 数量：'+ i.quantity + '，单价：' + i.price
                + '（万元）。经费来源：' + i.tags.map((t) => t.username).join('/') + ''};
        const newEvent = await new ctx.model.Event(event).save();
        // console.log('___GETREQ:' + JSON.stringify(newEvent));
        const result = {status: 'ok'};
        ctx.body = result;
        //ctx.body = newImplement; //'Data added -myy';
      } catch (e) {
        console.log(`###error ${e}`)
        ctx.status = 400;
        ctx.body = {status: 'Error!'};
        //throw e
      }
    } else {
        ctx.response.status = 401; //'用户没有权限（令牌、用户名、密码错误）。会导致antPro客户端重新登录'
        ctx.body = '404 not found-myy';
    };
  };
};

module.exports = ImplementController;
