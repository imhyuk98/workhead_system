const express = require('express')
const ejs = require('ejs')
const app = express()
const port = 3001
var bodyParser = require('body-parser')
var session = require('express-session')
const dotenv = require("dotenv")
dotenv.config();

const fs = require('fs')
const data = fs.readFileSync('./database.json');
const conf = JSON.parse(data);
const mysql = require('mysql2')


const connection = mysql.createConnection({
    host: conf.host,
    user: conf.user,
    password: conf.password,
    port: conf.port,
    database: conf.database
});
connection.connect();

connection.query("SET time_zone='Asia/Seoul'");


app.set('view engine', 'ejs')
app.set('views', './views')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(__dirname + '/public'))

app.use(session({ secret: 'unidago', cookie: { maxAge: 60000 }, resave: true, saveUninitialized: true, }))

app.use((req, res, next) => {


    res.locals.user_id = "";
    res.locals.name = "";

    if (req.session.member) {
        res.locals.user_id = req.session.member.user_id
        res.locals.name = req.session.member.name
    }
    next()
})



app.get('/', (req, res) => {
    console.log(req.session.member);

    res.render('index')   // ./views/index.ejs  
})

app.get('/profile', (req, res) => {
    res.render('profile')
})

app.get('/map', (req, res) => {
    res.render('map')
})

app.get('/contact', (req, res) => {
    res.render('contact')
})


app.post('/contactProc', (req, res) => {
    const name = req.body.name;
    const phone = req.body.stu_num;
    const memo = req.body.memo;

    var sql = `insert into attendance(name,stu_num,memo,regdate)
   values(?,?,?,now() )`

    var values = [name, phone, memo];

    connection.query(sql, values, function (err, result) {
        if (err) throw err;
        console.log('자료 1개를 삽입하였습니다.');
        res.send("<script> alert('출석되었습니다.'); location.href='/';</script>");
    })

})


app.get('/contactDelete', (req, res) => {
    var idx = req.query.idx
    var sql = `delete from attendance where idx='${idx}' `
    connection.query(sql, function (err, result) {
        if (err) throw err;

        res.send("<script> alert('삭제되었습니다.'); location.href='/contactList';</script>");
    })
})


app.get('/contactList', (req, res) => {

    var sql = `select * from attendance order by idx desc `
    connection.query(sql, function (err, results, fields) {
        if (err) throw err;
        res.render('contactList', { lists: results })
    })

})

app.get('/member', (req, res) => {

    var sql = `select * from mem order by idx desc `
    connection.query(sql, function (err, results, fields) {
        if (err) throw err;
        res.render('member', { lists: results })
    })

})

app.get('/memberDelete', (req, res) => {
    var idx = req.query.idx
    var sql = `delete from mem where idx='${idx}' `
    connection.query(sql, function (err, result) {
        if (err) throw err;

        res.send("<script> alert('삭제되었습니다.'); location.href='/member';</script>");
    })
})

app.get('/login', (req, res) => {
    res.render('login')
})


app.post('/loginProc', (req, res) => {
    const user_id = req.body.user_id;
    const pw = req.body.pw;

    var sql = `select * from mem  where user_id=? and pw=? `

    var values = [user_id, pw];

    connection.query(sql, values, function (err, result) {
        if (err) throw err;

        if (result.length == 0) {
            res.send("<script> alert('존재하지 않는 아이디입니다..'); location.href='/login';</script>");
        } else {
            console.log(result[0]);

            req.session.member = result[0]
            res.send("<script> alert('로그인 되었습니다.'); location.href='/';</script>");
            //res.send(result); 
        }
    })

})



app.get('/logout', (req, res) => {

    req.session.member = null;
    res.send("<script> alert('로그아웃 되었습니다.'); location.href='/';</script>");


})

app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/registerProc', (req, res) => {
    const user_id = req.body.user_id;
    const pw = req.body.pw;
    const name = req.body.name;
    const stu_num = req.body.stu_num;
    const phone = req.body.phone;

    var sql = `insert into mem(user_id,pw,name,stu_num,phone) values(?,?,?,?,?)`

    var values = [user_id, pw, name, stu_num, phone];

    connection.query(sql, values, function (err, result) {
        if (err) throw err;
        console.log('회원 추가.');
        res.send("<script> alert('회원가입 되셨습니다.'); location.href='/';</script>");
    })

})

app.get('/address', (req, res) => {

    var sql = `select * from addressbook order by idx desc `
    connection.query(sql, function (err, results, fields) {
        if (err) throw err;
        res.render('address', { lists: results })
    })

})

app.post('/addressProc', (req, res) => {
    const name = req.body.name;
    const sex = req.body.sex;
    const age = req.body.age;
    const address = req.body.address;
    const phone = req.body.phone;
    const picture = req.body.picture;

    var sql = `insert into addressbook(name,sex,age,address,phone,picture) values(?,?,?,?,?,?)`

    var values = [name, sex, age, address, phone, picture];

    connection.query(sql, values, function (err, result) {
        if (err) throw err;
        console.log('주소록 추가.');
        res.send("<script> alert('주소록에 등록되었습니다.'); location.href='/';</script>");
    })

})

app.get('/park', (req, res) => {

    var sql = `select * from addressbook order by idx desc `
    connection.query(sql, function (err, results, fields) {
        if (err) throw err;
        res.render('park', { lists: results })
    })

})

app.listen(port, () => {
    console.log(`서버가 실행되었습니다. 접속주소 : http://localhost:${port}`)
})