'use strict';

const toTreeData = require('../public/utils');

const Controller = require('egg').Controller;

class PartyController extends Controller {

  // app/controller/party.js

  //index = async (ctx) => {
  //  ctx.body = await ctx.model.Party.find({});  // you should use upper case to access mongoose model
  //}

  async getDept() {
    const ctx = this.ctx;
    //TODO: 提供异常和错误处理
    if (ctx.isAuthenticated()) {
      try{
        //var product = await ProductCol.find({_id: id}) // find a doc; 这里必须用await来同步，因mongoose's CRUD函数返回的都是Promise！
        const Party = await ctx.model.Party.find({type: '部门'}).sort('updatedAt'); //从数据库中找出Party
        //console.log(Party);
        var result;
        if(Party.length > 0){
          result = {
            currentDept: Party[0].username || 'xxxxxxxx', //此句放前面，因toTreeData会破坏Party！
            list: toTreeData(Party),
          }
        } else { //避免返回undefined
          result = {
            currentDept: '',
            list: []
          };
        };
        ctx.body = result;
        console.log('BODY:' + JSON.stringify(ctx.body));
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

  async getParty() {
    const ctx = this.ctx;
    //TODO: 提供异常和错误处理
    if (ctx.isAuthenticated()) {
      try{
        //var product = await ProductCol.find({_id: id}) // find a doc; 这里必须用await来同步，因mongoose's CRUD函数返回的都是Promise！
        const Party = await ctx.model.Party.find({}).sort('-updatedAt'); //从数据库中找出Party
        //console.log(Party);
        const result = {
          list: Party,
          pagination: {
            total: Party.length,
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
            console.log('To add: ' + JSON.stringify(party));
            const newParty = await new ctx.model.Party(party).save(); //function (err) { if (err) return console.error(err); }
            break;
          case 'delete':
            //console.log('To delete: ' + JSON.stringify(party).id);
            var ids = party.id.split(",");
            console.log('To delete: ' + ids);
            //var ObjectID = ctx.app.mongoose.Schema.Types.ObjectId;
            //var id = new ObjectID;
            var ids = party.id.split(",");
            //ids.map( id => ctx.model.Party.remove({_id: id})); //err => { if (err) return console.log(err); })); 
            //findByIdAndRemove() executes immediately if callback is passed, else a Query object is returned!!
            //ids.map( id => ctx.model.Party.findByIdAndRemove(id, err => { if (err) return console.log(err); })); 
            // async pro(id) { await ctx.model.Party.findByIdAndRemove(id);}
            ids.map( async (id) => await ctx.model.Party.findByIdAndRemove(id) ); // 注意map，async 和 await的配合！
            break;
          default:
            break;
        };
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
        }  
        ctx.body = result;
        //ctx.body = newParty; //'Data added -myy';
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

module.exports = PartyController;
