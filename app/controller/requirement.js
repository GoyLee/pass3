'use strict';
const toTreeData = require('../public/utils');
// const getUrlParams = require('../public/getParams')
const Controller = require('egg').Controller;

class RequirementController extends Controller {
  // app/controller/requirement.js
  //index = async (ctx) => {
  //  ctx.body = await ctx.model.Requirement.find({});  // you should use upper case to access mongoose model
  //}
  //返回部门树，不是列表！ 
  /*
  async getReqTree() {
    const ctx = this.ctx;
    if (ctx.isAuthenticated()) {
      try{
        //var product = await ProductCol.find({_id: id}) // find a doc; 这里必须用await来同步，因mongoose's CRUD函数返回的都是Promise！
        const Requirement = await ctx.model.Requirement.find({type: '部门'}).sort('updatedAt'); //从数据库中找出Requirement
        //console.log(Requirement);
        var result;
        if(Requirement.length > 0){
          result = {
            currentDept: Requirement[0].username || 'xxxxxxxx', //此句放前面，因toTreeData会破坏Requirement！
            list: toTreeData(Requirement),
          }
        } else { //避免返回undefined
          result = {
            currentDept: '',
            list: [],
          };
        };
        ctx.body = result;
        ctx.status = 200;
        console.log('GET DEPT:' + JSON.stringify(ctx.body));
      } catch (e) {
        console.log(`###error ${e}`)
        ctx.body = 'Data not found -myy';
        ctx.status = 500;
        //throw e
      }
    } else {
    //  ctx.response.status = 401; //'用户没有权限（令牌、用户名、密码错误）。会导致antPro客户端重新登录'
      //ctx.body = '404 not found-myy';
      ctx.status = 401;
    };
  } */
  //返回Requirement列表
  async getRequirement() {
    const ctx = this.ctx;
    if (ctx.isAuthenticated()) {
      try{
        console.log('___QUERY_REQ:' + JSON.stringify(ctx.query));
        var where = {};
        //where因koa\egg的ctx.query不能解析嵌套对象，只能是按业务逐表定制
        if (ctx.query.selectedDept) {
          //console.log('___QUERY:' + ctx.query.selectedDept);
          where = {...where, pid: ctx.query.selectedDept }
        }
        if (ctx.query.state) {
          const s = ctx.query.state.split(',');
          const q = s.length > 1 ? {$in: s} : s[0]; 
          // console.log('___QUERY:' + JSON.stringify(q));
          where = {...where, state: q };
        }
        if (ctx.query.reqname) {
          //console.log('___QUERY:' + ctx.query.selectedDept);
          const reg = new RegExp(ctx.query.reqname, 'i');
          where = {...where, reqname: {$regex : reg}}
        }
        let pageSize = parseInt(ctx.query.pageSize) || 10;
        let current = parseInt(ctx.query.currentPage) || 1;
        // let sorter = ctx.query.sorter || {updatedAt: -1};
        var sorterField = ctx.query.sorter || '-updatedAt';
        var s = sorterField[0] === '-' ? '{"' + sorterField.slice(1) + '": -1}' : '{"' + sorterField + '": 1}'
        var sorter = JSON.parse(s); //注意上面s的拼接方式
        // console.log('sorter:' + s);
        //if (ctx.query.pageSize) {
        //  pageSize = ctx.query.pageSize * 1;
        //}
        //const params = getUrlParams(ctx.request.href);
        //if (params.selectedDept) {
        //  console.log('___QUERY:' + params.selectedDept);
        //  where = {...where, pid: params.selectedDept }
        //}
        //var product = await ProductCol.find({_id: id}) // find a doc; 这里必须用await来同步，因mongoose's CRUD函数返回的都是Promise
        const count = await ctx.model.Requirement.find(where).count();
        //从数据库中找出Requirement
        // const Requirements = await ctx.model.Requirement.find(where)
              // .sort(sorter)
              // .skip((current-1) * pageSize)
              // .limit(pageSize)
              // .populate( [
              //   { path: 'demanderId', select: 'username -_id' },        // match: { age: { $gte: 21 }}, options: { limit: 5 },                  
              //   { path: 'deptIds', select: 'username -_id' },        // match: { age: { $gte: 21 }}, options: { limit: 5 },                  
              //   { path: 'tags', select: 'username -_id' },        // match: { age: { $gte: 21 }}, options: { limit: 5 },                  
              // ]);

        const Requirements = await ctx.model.Requirement.aggregate([
                { $match : where },
                { $sort : sorter },
                { $skip : (current-1) * pageSize },
                { $limit : pageSize },
                // { $lookup: {from: "Party", localField:"tags", foreignField: "_id", as: "tagNames"} },
                { $graphLookup: { //多级查找
                  from: "parties",
                  startWith: "$tags",
                  connectFromField: "tags",
                  connectToField: "_id",
                  maxDepth: 0,
                  depthField: "_depth",
                  as: "tagRecords", // 每个tag按_id都展开为一个record。再由前端找到其中的username。
                  },
                },
                // { $count: "count"},
                // { $project : { tagNames : "$tagRecords.username" } }, //字段筛选并改名
              ]);
        //console.log(Requirements);
        const result = {
          list: Requirements, //Requirements[0].count,
          pagination: {
            total: count,
            pageSize: pageSize,
            current: current,
            //current: parseInt(params.currentPage, 10) || 1,
          },
        }  
        ctx.body = result;
        ctx.status = 200;
        console.log('___GETREQ:' + JSON.stringify(ctx.body));
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

  async postRequirement() {
    const ctx = this.ctx;
    if (ctx.isAuthenticated()) {
      try{
        var requirement = ctx.request.body;
        //{method} = requirement;
        switch (requirement.method) {
          case 'post':
            //requirement = {...requirement, createdAt: Date.now() };
            console.log('___ADD:' + JSON.stringify(requirement));
            const newRequirement = await new ctx.model.Requirement(requirement).save(); //function (err) { if (err) return console.error(err); }
            ctx.status = 201;
            break;
          case 'update':
            console.log('___UPDATE:' + JSON.stringify(requirement));
            requirement = {...requirement, updatedAt: Date.now()};
            const oldRequirement = await ctx.model.Requirement.findByIdAndUpdate(requirement._id, requirement); //function (err) { if (err) return console.error(err); }
            ctx.status = 201;
            break;
          case 'delete':
            //console.log('To delete: ' + JSON.stringify(requirement).id);
            var ids = requirement.id.split(",");
            console.log('___DELETE:' + ids);
            //var ObjectID = ctx.app.mongoose.Schema.Types.ObjectId;
            //var id = new ObjectID;
            //ids.map( id => ctx.model.Requirement.remove({_id: id})); //err => { if (err) return console.log(err); })); 
            //findByIdAndRemove() executes immediately if callback is passed, else a Query object is returned!!
            //ids.map( id => ctx.model.Requirement.findByIdAndRemove(id, err => { if (err) return console.log(err); })); 
            // async pro(id) { await ctx.model.Requirement.findByIdAndRemove(id);}
            ids.map( async (id) => await ctx.model.Requirement.findByIdAndRemove(id) ); // 注意map，async 和 await的配合！
            ctx.status = 204;
            break;
          default:
            break;
        };
        /*
        const Requirements = await ctx.model.Requirement.find({}).sort('-updatedAt'); //从数据库中找出requirement
        //console.log(Requirement);
        const result = {
          list: Requirements,
          pagination: {
            total: Requirements.length,
            pageSize: 10,
            current: 1,
            //current: parseInt(params.currentPage, 10) || 1,
          },
        }*/
        const result = {status: 'ok'};
        ctx.body = result;
        //ctx.body = newRequirement; //'Data added -myy';
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

module.exports = RequirementController;
