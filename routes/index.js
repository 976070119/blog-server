var express = require('express');
var router = express.Router();
var app = express();
var formidable = require("formidable");
var { UserModel, ArticleModel, VisitModel } = require('../db/models');

var fs = require("fs");
const md5 = require('blueimp-md5');
const filter = { passWord: 0, __v: 0 };

//图片上传
router.use('/public', express.static('public'));
router.post('/upload', function (req, res) {
  var timestamp = new Date().getTime();
  var form = new formidable.IncomingForm();
  form.parse(req, function(error, fields, files) {
    let type = files.avatar.type;
    type = type.split('/')[1] ==='jpeg' ? 'jpg' : type.split('/')[1];
    let url = "public/images/" + timestamp + '.' + type;
      fs.writeFileSync(url, fs.readFileSync(files.avatar.path));
      res.send({ code: 0, src: url, success: 'true'});
  });
});

/* GET home page. */
router.get('/v', function (req, res, next) {
  VisitModel.findOne({}, (err, data)=> {
    VisitModel.findByIdAndUpdate({ _id: data._id }, { visits: data.visits * 1 + 1 },(err, data)=> {
      res.send({code: 0, success: 'true'});
      return;
    })
  })
});

//浏览数
router.get('/visit', function (req, res, next) {
  VisitModel.findOne({}, (err, data)=> {
    res.send({code: 0, data: { visits: data.visits }, success: 'true'});
  })
});



//注册
router.post('/register', (req, res) => {
  const { userName, passWord, remeber, type } = req.body;
  UserModel.findOne({ userName }, (err, data) => {
    if (data) {
      res.send({ code: 1, success: 'false' });
    } else {
      let createdTime = new Date().toLocaleString();
      new UserModel({ userName, passWord: md5(passWord), type, createdTime }).save((err, data) => {
        if(err)throw new Error("注册失败!");
        if (remeber) {
          res.cookie('userid', data._id, { maxAge: 1000 * 60 * 60 * 24 * 7 });
        }
        res.send({ code: 0, data: { _id: data._id, userName, type, createdTime: data.createdTime }, success: 'true' });
      })
    }
  })
})

// 登录
router.post('/login', (req, res) => {
  const { userName, passWord, remeber } = req.body;
  let loginTime = new Date().toLocaleString();
  UserModel.findOne({ userName }, (err, data) => {
    if (data) {
      UserModel.findOne({ userName, passWord: md5(passWord) }, filter, (err, data) => {
        if(err)throw new Error("登录失败!");
        if (data) {
          UserModel.findByIdAndUpdate({ _id: data._id }, { loginTime },(err, data)=> {
            if (remeber) {
              res.cookie('userid', data._id, { maxAge: 1000 * 60 * 60 * 24 * 7 });
            }
            res.send({ code: 0, data: { _id: data._id, userName, type: data.type, createdTime: data.createdTime, loginTime: data.loginTime }, success: 'true' });
          })} else {
          res.send({ code: 1, success: 'false' });
        }
      })
    } else {
      res.send({ code: -1, success: 'false' })
    }
  })
})

//获取用户数据
router.get('/getUser', (req, res) => {
  const { userid } = req.cookies;
  UserModel.findById({_id: userid}, filter, (err, data) => {
    if(err)throw new Error("获取失败!");
    if(data) {
      res.send({code: 0, data, success: 'true'})
    } else {
      res.send({code: 1, msg: '获取失败!', success: 'false'});
    }
  })
})

//更新用户数据
router.post('/updateUser', (req, res) => {
  const { userid } = req.cookies;
  if(!userid) {
    return res.send({code: 1, msg: '请先登录!', success: 'false'});
  }
  UserModel.findByIdAndUpdate({ _id: userid }, req.body, (err, data) => {
    if(data) {
      const { 
        _id, 
        userName, 
        nickName, 
        type, 
        avatar, 
        birthday, 
        motto, 
        createdTime, 
        modifyTime, 
        loginTime } = data;
      res.send({ code: 0, data: Object.assign({_id, 
        userName, 
        nickName, 
        type, 
        avatar, 
        birthday, 
        motto, 
        createdTime, 
        modifyTime, 
        loginTime}, req.body )});
    } else {
      res.clearCookie('userid');
      res.send({code: 1, msg: '请先登录!', success: 'false'});
    }
  } )
})


//获取文章列表
router.get('/articleList', (req, res) => {
  ArticleModel.find({}, filter, (err, data) => {
    if(err)throw new Error("获取失败!");
    if(data) {
      res.send({ code: 0, data, success: 'true'});
    }
  })
})

//发布文章
router.post('/publish', (req, res) => {
  const { title, desc, content, tags } = req.body;
  let publishTime = new Date().toLocaleString();
  new ArticleModel({ title, desc, content, tags, publishTime }).save((err, data) => {
    if(err) throw new Error("发布失败!");
    res.send({ code: 0, data, success: 'true' });
  })
})

//修改文章
router.post('/modify', (req, res) => {
  const { id, title, desc, content, tags } = req.body;
  let publishTime = new Date().toLocaleString();
  ArticleModel.findByIdAndUpdate({_id: id}, req.body, (err, data) => {
    res.send({err, data})
  })
})


module.exports = router;
