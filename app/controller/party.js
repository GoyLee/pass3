'use strict';
const toTreeData = require('../public/utils');
const getUrlParams = require('../public/getParams')
const Controller = require('egg').Controller;
const nodeExcel = require('excel-export');

class PartyController extends Controller {
  // app/controller/party.js
  //返回标签树，不是列表！
  async getTagTree() {
    const ctx = this.ctx;
    //TODO: 提供异常和错误处理
    if (ctx.isAuthenticated()) {
      try{
        console.log('___QUERY_TAGS:' + JSON.stringify(ctx.query));
        // find a doc; 这里必须用await来同步，因mongoose's CRUD函数返回的都是Promise！
        // const Party = await ctx.model.Party.find({type: '标签'}).sort('updatedAt'); //从数据库中找出Party
        const tags = await ctx.model.Party.aggregate( [
          { $match : { type: '标签' } }, //记录筛选
          { $unwind : { path:"$tags", preserveNullAndEmptyArrays: true }}, //标签展开
          { $project : { username:1, pid : "$tags" } }, //字段筛选并改名
          //这里要响应tree，每个节点仅需知道其父节点即可，不需知道祖父以上的节点，用$unwind更简单！
          // { $graphLookup: { //多级查找
          //       from: "parties",
          //       startWith: "$tags",
          //       connectFromField: "tags",
          //       connectToField: "_id",
          //       maxDepth: 0,
          //       depthField: "numConnections",
          //       as: "ancestors"
          //   },
          // }
        ] )
        // console.log('__TAGS:' + JSON.stringify(tags));
        var result;
        if(tags.length > 0){
          result = {
            currentDept: tags[0].username || 'xxxxxxxx', //此句放前面，因toTreeData会破坏tags！
            list: toTreeData(tags),
          }
        } else { //避免返回undefined
          result = {
            currentDept: '',
            list: [],
          };
        };
        ctx.body = result;
        ctx.status = 200;
        console.log('GET_TAGS_TREE:' + JSON.stringify(ctx.body));
      } catch (e) {
        console.log(`###error ${e}`)
        ctx.body = 'Data not found -myy';
        ctx.status = 500;
        //throw e
      }
    } else {
      //ctx.body = '404 not found-myy';
      ctx.status = 401; //'用户没有权限（令牌、用户名、密码错误）。会导致antPro客户端重新登录'
    };
  }
  //返回部门树，不是列表！
  async getDeptTree() {
    const ctx = this.ctx;
    //TODO: 提供异常和错误处理
    if (ctx.isAuthenticated()) {
      try{
        // find a doc; 这里必须用await来同步，因mongoose's CRUD函数返回的都是Promise！
        // const Party = await ctx.model.Party.find({type: '部门'}).sort('updatedAt'); //从数据库中找出Party
        //console.log(Party);
        const depts = await ctx.model.Party.aggregate( [
          { $match : { type: '部门' } }, //记录筛选
          { $unwind : { path:"$pid", preserveNullAndEmptyArrays: true }}, //部门逐级展开
          { $project : { username:1, pid : 1 } }, //字段筛选，_id默认已选
          { $group : { _id : "$_id", username: {$last: '$username'}, pid: {$last: '$pid'} } }, //去重并取叶子节点（unwind后的最后一行记录）
        ] );
        var result;
        if(depts.length > 0){
          result = {
            currentDept: depts[0].username || 'xxxxxxxx', //此句放前面，因toTreeData会破坏depts！
            list: toTreeData(depts),
          }
        } else { //避免返回undefined
          result = {
            currentDept: '',
            list: [],
          };
        };
        ctx.body = result;
        ctx.status = 200;
        console.log('GET_DEPT_TREE:' + JSON.stringify(ctx.body));
      } catch (e) {
        console.log(`###error ${e}`)
        ctx.body = 'Data not found -myy';
        ctx.status = 500;
        //throw e
      }
    } else {
      //ctx.body = '404 not found-myy';
      ctx.status = 401; //'用户没有权限（令牌、用户名、密码错误）。会导致antPro客户端重新登录'
    };
  }
  //返回Party列表
  async getParty() {
    const ctx = this.ctx;
    //TODO: 提供异常和错误处理
    if (ctx.isAuthenticated()) {
      try{
        console.log('___QUERY:' + JSON.stringify(ctx.query));
        var where = {};
        //where因koa\egg的ctx.query不能解析嵌套对象，只能是按业务逐表定制
        if (ctx.query.selectedDept) {
          //console.log('___QUERY:' + ctx.query.selectedDept);
          where = {...where, pid: ctx.query.selectedDept } //it works! Here, pid is [], ~pid 'has' selectedDept!, Mongo doesn't has 'has' operator!
        }
        if (ctx.query.selectedTag) {
          //console.log('___QUERY:' + ctx.query.selectedDept);
          where = {...where, tags: ctx.query.selectedTag } //it works! Here, tags is [], ~tags 'has' selectedTag!, Mongo doesn't has 'has' operator!
        }
        if (ctx.query.status) {
          //console.log('___QUERY:' + ctx.query.selectedDept);
          where = {...where, status: ctx.query.status }
        }
        if (ctx.query.id) {
          where = {...where, _id: ctx.query.id }
        }
        if (ctx.query.username) {
          //console.log('___QUERY:' + ctx.query.selectedDept);
          const reg = new RegExp(ctx.query.username, 'i'); //模糊查询
          where = {...where, username: {$regex : reg}}
        }
        let pageSize = parseInt(ctx.query.pageSize) || 10;
        let current = parseInt(ctx.query.currentPage) || 1;
        let sorter = ctx.query.sorter || '-updatedAt';
        //if (ctx.query.pageSize) {
        //  pageSize = ctx.query.pageSize * 1;
        //}
        //const params = getUrlParams(ctx.request.href);
        //if (params.selectedDept) {
        //  console.log('___QUERY:' + params.selectedDept);
        //  where = {...where, pid: params.selectedDept }
        //}
        //var product = await ProductCol.find({_id: id}) // find a doc; 这里必须用await来同步，因mongoose's CRUD函数返回的都是Promise
        const count = await ctx.model.Party.find(where).count();
        const Party = await ctx.model.Party.find(where).sort(sorter).skip((current-1) * pageSize).limit(pageSize); //从数据库中找出Party
        //console.log(Party);
        const result = {
          list: Party,
          pagination: {
            total: count,
            pageSize: pageSize,
            current: current,
            //current: parseInt(params.currentPage, 10) || 1,
          },
        }  
        ctx.body = result;
        ctx.status = 200;
        console.log('___GETPARTY:' + JSON.stringify(ctx.body));
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
  }
  //增删改
  async postParty() {
    const ctx = this.ctx;
    //TODO: 提供异常和错误处理
    if (ctx.isAuthenticated()) {
      try{
        var party = ctx.request.body;
        //{method} = party;
        switch (party.method) {
          case 'post':
            //party = {...party, createdAt: Date.now() };
            console.log('ADD:' + JSON.stringify(party));
            const newParty = await new ctx.model.Party(party).save(); //function (err) { if (err) return console.error(err); }
            ctx.status = 201;
            break;
          case 'update':
            console.log('UPDATE:' + JSON.stringify(party));
            party = {...party, updatedAt: Date.now()};
            const oldParty = await ctx.model.Party.findByIdAndUpdate(party._id, party); //function (err) { if (err) return console.error(err); }
            ctx.status = 201;
            break;
          case 'delete':
            //console.log('To delete: ' + JSON.stringify(party).id);
            var ids = party.id.split(",");
            console.log('DELETE:' + ids);
            //var ObjectID = ctx.app.mongoose.Schema.Types.ObjectId;
            //var id = new ObjectID;
            //ids.map( id => ctx.model.Party.remove({_id: id})); //err => { if (err) return console.log(err); })); 
            //findByIdAndRemove() executes immediately if callback is passed, else a Query object is returned!!
            //ids.map( id => ctx.model.Party.findByIdAndRemove(id, err => { if (err) return console.log(err); })); 
            // async pro(id) { await ctx.model.Party.findByIdAndRemove(id);}
            ids.map( async (id) => await ctx.model.Party.findByIdAndRemove(id) ); // 注意map，async 和 await的配合！
            ctx.status = 204;
            break;
          default:
            break;
        };
        /*
        const Parties = await ctx.model.Party.find({}).sort('-updatedAt'); //从数据库中找出party
        //console.log(Party);
        const result = {
          list: Parties,
          pagination: {
            total: Parties.length,
            pageSize: 10,
            current: 1,
            //current: parseInt(params.currentPage, 10) || 1,
          },
        } */
        const result = {status: 'ok'};
        ctx.body = result;
        //ctx.body = newParty; //'Data added -myy';
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

  //返回模糊查询的用户列表
  async getUserList() {
    const ctx = this.ctx;
    if (ctx.isAuthenticated()) {
      try{
        console.log('___QUERY:' + JSON.stringify(ctx.query));
        var where = {type: '员工', status: '正常'};
        if (ctx.query.username) {
          //console.log('___QUERY:' + ctx.query.selectedDept);
          const reg = new RegExp(ctx.query.username, 'i'); //模糊查询
          where = {...where, username: {$regex : reg}}
        }
        //var product = await ProductCol.find({_id: id}) // find a doc; 这里必须用await来同步，因mongoose's CRUD函数返回的都是Promise
        //const count = await ctx.model.Party.find(where).count();
        var Party = await ctx.model.Party.find(where).sort('username').select('_id username pid').limit(5);
                      //.populate({path: 'pid', select: 'username'}); //.aggregate({$project:{myid:"$_id"}})
        //console.log(Party);
        const result = Party;  
        ctx.body = result;
        ctx.status = 200;
        console.log('___GETUSERLIST:' + JSON.stringify(ctx.body));
      } catch (e) {
        console.log(`###error ${e}`)
        //ctx.body = 'Data not found -myy';
        ctx.status = 500;
        //throw e
      }
    } else {
      ctx.response.status = 401; //'用户没有权限（令牌、用户名、密码错误）。会导致antPro客户端重新登录'
      ctx.body = '404 not found-myy';
      //ctx.status = 401;
    };
  };
  //返回某_id的Party
  async getUserDept() {
    const ctx = this.ctx;
    if (ctx.isAuthenticated()) {
      try{
        console.log('___UerDeptQUERY:' + JSON.stringify(ctx.query));
        //var where = {type: '员工', status: '正常'};
        var where;
        if (ctx.query.id) {
          where = {...where, _id: ctx.query.id }
        }
        //var product = await ProductCol.find({_id: id}) // find a doc; 这里必须用await来同步，因mongoose's CRUD函数返回的都是Promise
        //const count = await ctx.model.Party.find(where).count();
        var Party = await ctx.model.Party.find(where).select('_id username pid');//sort('username').
                      //.populate({path: 'pid', select: 'username'}); //.aggregate({$project:{myid:"$_id"}})
        //console.log(Party);
        /*
        Party = Party.filter( (p) => (p.pid) ); //找出有父节点的
        const fun = async (p) => {
          var p1 = await ctx.model.Party.find({_id: p.pid});
          var t = {_id:p._id, username: p.username, pid: p1[0].pid, deptname: p1[0].username};
          //console.log(JSON.stringify(t));
          return t;
        }
        //没有promise.all, await map返回的是promise数组，并不是value数组，
        //必须先用Promise.all同步，再用await保证中断.
        var Party = await (Promise.all( Party.map( p => fun (p))));  
        */
        const result = Party[0]; //return only one  
        ctx.body = result;
        ctx.status = 200;
        console.log('___GETUSERDEPT:' + JSON.stringify(ctx.body));
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

  /**
   * 导出excel
   * @param _headers example  [
   {caption:'用户状态',type:'string'},
   {caption:'部门',type:'string'},
   {caption:'姓名',type:'string'},
   {caption:'邮箱',type:'string'},
   {caption:'有效期',type:'string'},
   {caption:'身份',type:'string'}];
   * @param rows example 
   [['未激活','信息部','testname','123@qq.com','2019-11-09','管理员'],
   ['未激活','信息部','testname2','12345@qq.com','2019-11-09','普通成员']]
   */
  exportExcel(_headers,rows){
      var conf ={};
      // conf.stylesXmlFile = "styles.xml";
      conf.name = "mysheet";
      conf.cols = [];
      for(var i = 0; i < _headers.length; i++){
          var col = {};
          col.caption = _headers[i].caption;
          col.type = _headers[i].type;
          conf.cols.push(col);
      }
      conf.rows = rows;
      var result = nodeExcel.execute(conf);
      return result;
  }

  getExcel() {
    const ctx = this.ctx;
    if (ctx.isAuthenticated()) { //) {
      try{
        const _headers = [
          {caption:'用户状态',type:'string'},
          {caption:'部门',type:'string'},
          {caption:'姓名',type:'string'},
          {caption:'邮箱',type:'string'},
          {caption:'有效期',type:'string'},
          {caption:'身份',type:'string'}];
        const rows = 
          [['未激活','信息部','testname','123@qq.com','2019-11-09','管理员'],
          ['未激活','信息部','testname2','12345@qq.com','2019-11-09','普通成员']];
        //自己构造_headers和rows,导出excel
        var result = this.exportExcel(_headers,rows);
        ctx.response.set('Content-Type', 'application/vnd.openxmlformats'); ///'application/octet-stream'); 
        ctx.response.set("Content-Disposition", "attachment; filename=" + "test.xlsx");
        ctx.type = 'xlsx';
        const body = new Buffer(result, 'binary'); // 关键一句
        ctx.length = Buffer.byteLength(body);
        ctx.body = body;
       
        // ctx.response.set('Content-Type', 'text/plain;charset=utf8');///'application/octet-stream'); 
        // var result = 'Data found';
        // const body = new Buffer(result, 'utf8'); // 关键一句
        // ctx.body = body;
        ctx.status = 200;
        console.log('___GETEXCEL:' + JSON.stringify(ctx.body));
      } catch (e) {
        console.log(`###error ${e}`)
        ctx.body = 'Data not found -myy';
        ctx.status = 500;
      }
    } else {
      ctx.response.status = 401; //'用户没有权限（令牌、用户名、密码错误）。会导致antPro客户端重新登录'
      ctx.body = '404 not found-myy';
      //ctx.status = 401;
    };
    return;
  }
  

};

module.exports = PartyController;
