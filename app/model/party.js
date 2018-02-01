// app/model/user.js
module.exports = app => {
    const mongoose = app.mongoose;
    var PartySchema = new mongoose.Schema({
      code: { type: String  }, //required: true, , unique: true //工号
      username: { type: String  },
      password: { type: String  },
      email: { type: String  },
      mobile: { type: String  },
      desc: { type: String  }, //描述
      position: { type: String  }, //职务
      type: { type: String  }, //部门，项目，员工，小组
      status: { type: String  }, //状态：正常，兼职，离职，停职
      authority: { type: String }, //界面功能权限，角色，admin, user, guest
      provider: { type: String }, //认证方法
      createdAt: { type:Date, default: Date.now()}, //
      updatedAt: { type:Date },
      belongTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Party' }, //上级所属部门，唯一
      tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Party' }], //所属的项目、小组; addedAt: { type:Date, default: Date.now() 
      //树状的表中不要有children字段！会和前端的数据重复！
    });
    
    PartySchema.pre('save', function(next) { 
      //const currentDate = (new Date()).now()
      if (!this.createdAt) {
          this.createdAt = Date.now(); //currentDate;
      } else {
          this.updatedAt = Date.now(); //currentDate;
      }
      next();
    })

    return mongoose.model('Party', PartySchema);
  }
  
 //当product执行save()前，执行该代码片段，有点类似于中间件(这个方法内容仅仅是介绍pre()的使用方法)

/*
//当product执行save()后
productSchema.post('save', function(doc) {
  //logger.info(`Product ${doc._id} was saved.`)
  console.log(`Product ${doc._id} was saved.`)
})
*/