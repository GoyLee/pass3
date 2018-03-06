// app/model/user.js
module.exports = app => {
    const mongoose = app.mongoose;
    var EventSchema = new mongoose.Schema({
      name: { type: String , required: true }, //名称
      pid: { type: mongoose.Schema.Types.ObjectId}, //上级对象，说明本事件是关于什么的，可以是需求、项目、任务、表单等，唯一
      sid: { type: mongoose.Schema.Types.ObjectId}, //事件来源对象，说明本事件从什么对象的增删改而来的，如需求实现对象
      status: { type: String  }, //上级对象的状态：提出，处理中（转项目），取消/拒绝，挂起，关闭
      user: { type: String  }, //{ type: mongoose.Schema.Types.ObjectId, ref: 'Party' }, //提出人
      department: { type: String  }, //{ type: mongoose.Schema.Types.ObjectId, ref: 'Party' }, //提出人所属部门，指向party
      //amount: {type: Number }, //根据下级需求汇总上来的预算总额
      createdAt: { type:Date, default: Date.now()}, //
      //updatedAt: { type:Date, default: Date.now()},
      //tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }], //
      //树状的表中不要有children字段！会和前端的数据重复！
    });
    //mongoose: pre/post中间件对update类函数不起作用！
    /*
    PartySchema.pre('save', function(next) { 
      //const currentDate = (new Date()).now()
      if (!this.createdAt) {
          this.createdAt = Date.now(); //currentDate;
      } else {
          this.updatedAt = Date.now(); //currentDate;
      }
      next();
    })
   
    PartySchema.pre('findOneAndUpdate', function(next) { 
      //const currentDate = (new Date()).now()
      this.updatedAt = Date.now(); //currentDate;
      next();
    })
    */
    return mongoose.model('Event', EventSchema);
  }
  
 //当product执行save()前，执行该代码片段，有点类似于中间件(这个方法内容仅仅是介绍pre()的使用方法)

/*
//当product执行save()后
productSchema.post('save', function(doc) {
  //logger.info(`Product ${doc._id} was saved.`)
  console.log(`Product ${doc._id} was saved.`)
})
*/