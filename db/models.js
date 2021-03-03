const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/DATABASE_BLOG', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useFindAndModify', false)

const conn = mongoose.connection;

conn.on('connected', () => {
    console.log('server connect success!');
})

const userSchema = mongoose.Schema({
    userName: { type: String, required: true },
    passWord: { type: String, required: true },
    nickName: { type: String, required: false },
    type: { type: String, required: true },
    avatar: { type: String, required: false },
    birthday: { type: String, required: false },
    motto: { type: String, required: false },
    createdTime: { type: String, required: true },
    modifyTime: { type: String, required: false },
    loginTime: { type: String, required: false },
})

const articleSchema = mongoose.Schema({
    title: { type: String, required: true },
    desc: { type: String, required: true },
    content: { type: String, required: true },
    tags: { type: Array, required: false },
    totalWords: { type: String, required: false },
    readingTime: { type: String, required: false },
    publishTime: { type: String, required: true },
})

const visitSchema = mongoose.Schema({
    visits: { type: String, required: false }
})

const UserModel = mongoose.model('user', userSchema);
const ArticleModel = mongoose.model('article', articleSchema);
const VisitModel = mongoose.model('visit', visitSchema);

module.exports = {
    UserModel,
    ArticleModel,
    VisitModel
};
