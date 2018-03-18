'use strict';
// const getUrlParams = require('../public/getParams')
const Controller = require('egg').Controller;
const moment = require('moment');

class ImplementController extends Controller {
  // app/controller/implement.js
  //返回Implement列表
  async getImplement() {
    const ctx = this.ctx;
    if (ctx.isAuthenticated()) {
      try{
        console.log('___QUERY_Impl:' + JSON.stringify(ctx.query));
        var where = {};
        //where因koa\egg的ctx.query不能解析嵌套对象，只能是按业务逐表定制
        if (ctx.query.pid) {
          //console.log('___QUERY:' + ctx.query.selectedDept);
          where = {...where, pid: ctx.query.pid }
        }
        if (ctx.query.state) {
          const s = ctx.query.state.split(',');
          const q = s.length > 1 ? {$in: s} : s[0]; 
          // console.log('___QUERY:' + JSON.stringify(q));
          where = {...where, state: q };
        }
        if (ctx.query.type) {
          where = {...where, type: ctx.query.type };
        }
        if (ctx.query.name) {
          //console.log('___QUERY:' + ctx.query.selectedDept);
          const reg = new RegExp(ctx.query.name, 'i');
          where = {...where, name: {$regex : reg}}
        }
        let pageSize = parseInt(ctx.query.pageSize) || 10;
        let current = parseInt(ctx.query.currentPage) || 1;
        let sorter = ctx.query.sorter || '-updatedAt';
        //if (ctx.query.pageSize) {
        //  pageSize = ctx.query.pageSize * 1;
        //}
        //const params = getUrlParams(ctx.request.href);
        // you should use upper case to access mongoose model
        const count = await ctx.model.Implement.find(where).count();
        const Implements = await ctx.model.Implement.find(where).sort(sorter)
                  .populate('tags', 'username')
                  .populate('pid'); //.skip((current-1) * pageSize).limit(pageSize); //从数据库中找出Implement
        //console.log(Implement);
        // const result = Implements; //M: 要返回列表，不要返回对象
        const result = {
          list: Implements, //Requirements[0].count,
          pagination: {
            total: count,
            pageSize: pageSize,
            current: current,
            //current: parseInt(params.currentPage, 10) || 1,
          },
        }  
        ctx.body = result;
        ctx.status = 200;
        console.log('___GET_Implements:' + JSON.stringify(ctx.body));
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
//返回某_id的Implement
  async getOneImpl() {
    const ctx = this.ctx;
    if (ctx.isAuthenticated()) {
      try{
        console.log('___QueryOneImpl:' + JSON.stringify(ctx.query));
        //var where = {type: '员工', status: '正常'};
        var where={};
        if (ctx.query.id) {
          where = {...where, _id: ctx.query.id }
        }
        if (ctx.query.pid) {
          where = {...where, pid: ctx.query.pid }
        }
        if (ctx.query.type) {
          where = {...where, type: ctx.query.type }
        }
        // find a doc; 这里必须用await来同步，因mongoose's CRUD函数返回的都是Promise
        var impl = await ctx.model.Implement.findOne(where);//.select('_id username pid');
                      //.populate({path: 'pid', select: 'username'}); //.aggregate({$project:{myid:"$_id"}})
        //如是新建实际项时的对最近计划项的查询，需设置必要的字段
        // if (ctx.query.newActual){
        //   delete impl._id; // = undefined; //null;
        //   impl.type = '实际';
        // }
        const result = impl;  
        ctx.body = result;
        ctx.status = 200;
        console.log('___GEToneImpl:' + JSON.stringify(ctx.body));
      } catch (e) {
        console.log(`###error ${e}`)
        ctx.body = 'Data not found -myy';
        ctx.status = 500;
        //throw e
      }
    } else {
      ctx.response.status = 401; //'用户没有权限（令牌、用户名、密码错误）。会导致antPro客户端重新登录'
      ctx.body = '404 not found-myy';
      //ctx.status = 401;
    };
  };
  // 增删改
  async postImplement() {
    const ctx = this.ctx;
    if (ctx.isAuthenticated()) {
      try{
        var implement = ctx.request.body;
        var newImpl;
        //{method} = implement;
        // if (implement.method ==='changeReqState') {
        // // case 'cancelReq':
        // // case 'suspendReq':
        //   const j = implement;
        //   const event = {user: j.user, pid: j.pid, action: j.action,
        //                     name: '[ ' + j.action + '需求 ]：' + j.reqname };
        //   console.log('____ChangeReqState:' + JSON.stringify(event));
        //   const newEvent = await new ctx.model.Event(event).save();
        //   const oldRequirement = await ctx.model.Requirement.findByIdAndUpdate(j.pid, {state: j.state,  updatedAt: Date.now()});
        // } else {
        switch (implement.method) {
          case 'post':
            //implement = {...implement, createdAt: Date.now() };
            console.log('___ADD:' + JSON.stringify(implement));
            newImpl = await new ctx.model.Implement(implement).save(); //function (err) { if (err) return console.error(err); }
            // var id = newImplement._id;
            var type = '[新建] ';
            break;
          case 'update':
            console.log('___UPDATE:' + JSON.stringify(implement));
            // implement = {...implement, updatedAt: Date.now()};
            const returnImpl = await ctx.model.Implement.findByIdAndUpdate(implement._id, implement); //function (err) { if (err) return console.error(err); }
            newImpl = implement;
            // var id = implement._id;
            var type = '[更新] ';
            break;
          default:
            break;
        };
        //根据更新的结果，另保存一条“事件”：
        // const i = await ctx.model.Implement.findOne({_id: id}).populate('tags', 'username'); // populate tags' name
        const i = newImpl;
        // console.log('___Event_Add_from_Impl:' + JSON.stringify(i));
        const event = {user: i.user, pid: i.pid, sid: i._id, action: i.type,
                        name: type + i.budgetyear + '年, 标的：[' + i.name
                        +']，规格：['+ i.spec +']，数量：'+ i.quantity + '，单价：' + i.price
                        + '（万元）。标签：[' + i.tags.map((t) => t.username).join('/')
                        + ']。完成日期：'+ moment(i.date).format('YYYY-MM-DD')};
        const newEvent = await new ctx.model.Event(event).save();
        // };
        // console.log('___GETREQ:' + JSON.stringify(newEvent));
        const result = {status: 'ok'};
        ctx.status = 201;
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
