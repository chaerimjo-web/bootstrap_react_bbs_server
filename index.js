const cors = require('cors')
const express = require('express')
const app = express()
const port = 8000
const multer  = require('multer')


//본문을 통해서 넘어온 요청을 파싱(변환) 미들웨어(body-parser)를 이용하여 
app.use(express.json()); //json형식으로 변환 {"name":"Alice" , "age":"25"}
app.use(express.urlencoded());

var corsOptions = {
  origin: '*' //모든 출처허용
}

app.use(cors(corsOptions));
app.use("/uploads", express.static('uploads')); //uploads폴더에 접근 권한을 부여한다. 클라이언트가 접속할 수 있도록
//app.use(express.static('uploads')); //클라이언트가 이 위치에 접근할 수 있음. 

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 5)
    cb(null, uniqueSuffix + file.originalname)
  }
})

const upload = multer({ storage: storage })

const mysql = require('mysql')
const db = mysql.createConnection({
  host: 'localhost',
  user: 'react_bbs',
  password: '12345',
  database: 'react_bbs'
})

db.connect()
/*
app.get('/', (req, res) => {
  const sql = "INSERT INTO requested (rowno) VALUES (1)"; 
  db.query(sql, (err, rows, fields) => {
    if (err) throw err;
    res.send('성공')
    console.log('데이터 추가 성공')
  })
  // localhost:8000 서버 접속시 실행
})
*/

app.get('/list', (req, res) => { //데이터포맷변경
  const sql = "SELECT BOARD_ID, BOARD_TITLE, REGISTER_ID, DATE_FORMAT(REGISTER_DATE, '%Y-%m-%d') AS REGISTER_DATE FROM board";
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result)
  })
})

app.get('/detail', (req, res) => { //디테일에서 온 요청
  const id = req.query.id;
  console.log(id);
  const sql = "SELECT BOARD_TITLE, BOARD_CONTENT, IMAGE_PATH FROM board WHERE BOARD_ID = ?"; //물음표 ->[id]
  db.query(sql, [id], (err, result) => { //물음표 ->[id]
    if (err) throw err;
    res.send(result)
  })
})
app.post('/insert', upload.single('image'), (req, res) => {

  let title = req.body.title;
  let content = req.body.content;
  let imagePath = req.file? req.file.path : null; //req.files가 있다면path에 있고 없다면 null
//
  const sql = "INSERT INTO board (BOARD_TITLE, BOARD_CONTENT, IMAGE_PATH, REGISTER_ID) VALUES (?,?,?,'admin')";
  db.query(sql, [title, content, imagePath], (err, result) => {
    if (err) throw err;  
    res.send(result);
  })  
})


app.post('/update', (req, res) => { //update 요청이 들어오면 req매개변수가 들어옴

  // let title = req.body.title;
  // let content = req.body.content;
  // let id = req.body.id;
  //비구조 할당으로 바꿔보기
  const {id, title, content} = req.body;

  // const sql = "UPDATE 테이블명 SET 컬럼=값 WHERE 컬럼명 = 값"; ->
  // const sql = "UPDATE board SET BOARD_TITLE=title, BOARD_CONTENT=content WHERE BOARD_ID = ?"; ->
  const sql = "UPDATE board SET BOARD_TITLE=?, BOARD_CONTENT=? WHERE BOARD_ID = ?";
  db.query(sql, [title, content, id], (err, result) => {
    if (err) throw err;
    res.send(result) //결과를 result로 되돌려준다. 
  })
})

app.post('/delete', (req, res) => { //delete 요청이 들어오면 req매개변수가 들어옴

  // const boardIDList = req.body.boardIDList;
  const {boardIDList} = req.body;

  const sql = `DELETE FROM board WHERE BOARD_ID in (${boardIDList})`;
  console.log(sql);
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result) //결과를 result로 되돌려준다. 
  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

// db.end()