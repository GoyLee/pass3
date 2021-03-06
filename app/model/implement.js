// app/model/user.js
module.exports = app => {
    const mongoose = app.mongoose;
    var ImplementSchema = new mongoose.Schema({
      //code: { type: String  }, //required: true, , unique: true //工号
      pid: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Requirement' }], //上级需求
      budgetyear: { type: String, required: true  }, // 年度，如：2018,2019...
      name: { type: String , required: false }, //名称
      // desc: { type: String , required: false }, //必要性、描述
      tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Party' }], //经费渠道，资金来源，资金分类; 
      spec: { type: String  }, //规格
      quantity: {type: Number }, //需求数量
      price: {type: Number }, //单价
      // budget: {type: Number }, //预算额、总额，初始设定的
      amount: {type: Number }, //根据下级需求汇总上来的预算总额
      //fundsource: { type: String }, //资金来源：ARJ21，C919，CR929，课题，自筹
      state: { type: String  }, //实现项的状态：计划，启动，采购，到货，完成，取消，暂停
      action: { type: String  }, //根据“需求的”状态，所采取的对“需求的”实现行动：计划，启动，采购，到货，完成，取消，暂停/恢复
      type: { type: String  }, //继承自Requirement，和Requirement保持一致：应用、设备、软件、网络、服务等
      date: { type:Date }, //日期，计划的
      actualdate: { type:Date }, //日期，实际的
      user: { type: String  }, //{ type: mongoose.Schema.Types.ObjectId, ref: 'Party' }, //责任人
      createdAt: { type:Date, default: Date.now()}, //
      updatedAt: { type:Date, default: Date.now() },
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
    return mongoose.model('Implement', ImplementSchema);
  }
  
 //当product执行save()前，执行该代码片段，有点类似于中间件(这个方法内容仅仅是介绍pre()的使用方法)

/*
//当product执行save()后
productSchema.post('save', function(doc) {
  //logger.info(`Product ${doc._id} was saved.`)
  console.log(`Product ${doc._id} was saved.`)
})
*/