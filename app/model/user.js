// app/model/user.js
module.exports = app => {
    const mongoose = app.mongoose;
    var UserSchema = new mongoose.Schema({
      code: { type: String  }, //required: true, , unique: true
      username: { type: String  },
      password: { type: String  },
      type: { type: String  },
      state: { type: String  },
      authority: { type: String },
      provider: { type: String },
      createdAt: { type:Date, default: Date.now()}, //
      updatedAt: { type:Date },
      children: [{ addAt: { type:Date, default: Date.now() } }]
    });
    
    UserSchema.pre('save', function(next) { 
      //const currentDate = (new Date()).now()
      if (!this.createdAt) {
          this.createdAt = Date.now(); //currentDate;
      } else {
          this.updatedAt = Date.now(); //currentDate;
      }
      next();
    })

    return mongoose.model('User', UserSchema);
  }
  
 //当product执行save()前，执行该代码片段，有点类似于中间件(这个方法内容仅仅是介绍pre()的使用方法)

/*
//当product执行save()后
productSchema.post('save', function(doc) {
  //logger.info(`Product ${doc._id} was saved.`)
  console.log(`Product ${doc._id} was saved.`)
})
*/