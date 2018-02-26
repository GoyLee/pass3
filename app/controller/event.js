'use strict';
const getUrlParams = require('../public/getParams')
const Controller = require('egg').Controller;

class EventController extends Controller {
  // app/controller/event.js
  //返回Event列表
  async getEvent() {
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
        // const count = await ctx.model.Event.find(where).count();
        const Events = await ctx.model.Event.find(where).sort(sorter); //.skip((current-1) * pageSize).limit(pageSize); //从数据库中找出Event
        //console.log(Event);
        const result = Events; //M: 要返回列表，不要返回对象
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

  async postEvent() {
    const ctx = this.ctx;
    if (ctx.isAuthenticated()) {
      try{
        var event = ctx.request.body;
        //{method} = event;
        switch (event.method) {
          case 'post':
            //event = {...event, createdAt: Date.now() };
            console.log('ADD:' + JSON.stringify(event));
            const newEvent = await new ctx.model.Event(event).save(); //function (err) { if (err) return console.error(err); }
            ctx.status = 201;
            break;
          case 'update':
            console.log('UPDATE:' + JSON.stringify(event));
            event = {...event, updatedAt: Date.now()};
            const oldEvent = await ctx.model.Event.findByIdAndUpdate(event._id, event); //function (err) { if (err) return console.error(err); }
            ctx.status = 201;
            break;
          case 'delete':
            //console.log('To delete: ' + JSON.stringify(event).id);
            var ids = event.id.split(",");
            console.log('DELETE:' + ids);
            //var ObjectID = ctx.app.mongoose.Schema.Types.ObjectId;
            //var id = new ObjectID;
            //ids.map( id => ctx.model.Event.remove({_id: id})); //err => { if (err) return console.log(err); })); 
            //findByIdAndRemove() executes immediately if callback is passed, else a Query object is returned!!
            //ids.map( id => ctx.model.Event.findByIdAndRemove(id, err => { if (err) return console.log(err); })); 
            // async pro(id) { await ctx.model.Event.findByIdAndRemove(id);}
            ids.map( async (id) => await ctx.model.Event.findByIdAndRemove(id) ); // 注意map，async 和 await的配合！
            ctx.status = 204;
            break;
          default:
            break;
        };
        const result = {status: 'ok'};
        ctx.body = result;
        //ctx.body = newEvent; //'Data added -myy';
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

module.exports = EventController;
