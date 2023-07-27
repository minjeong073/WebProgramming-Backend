import express from 'express'; // module 로 가져오는 방식
// const express = require('express'); // commonJS 로 가져오는 방식
import pg from 'pg'; // DB 연결하기 위한 방식 1) connection, 2) connection pool
// instance와 server 연결하는 방법
import bodyParser from 'body-parser';
import cors from 'cors';
import passport from 'passport';
import { Strategy } from 'passport-local';
import jwt from 'jsonwebtoken';

const app = express();

const pool = new pg.Pool({
  host: 'ls-36013ca3bc63e5519bfd9d3387a46189c9b13beb.cnankpeeqn4z.ap-northeast-2.rds.amazonaws.com',
  user: 'dbmasteruser',
  password: '^K%idJElimf&NnyC!W[_6f2hVm1F%c;}',
  database: 'postgres',
});

passport.use(
  new Strategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    (username, password, done) => {
      if (username === 'admin@admin.com' && password === 'admin') {
        return done(null, {
          id: admin,
        });
      } else {
        done(null, false);
        // 아래에 id, pw 에 따라 다른 error 출력 로직 작성
      }
    }
  )
);
passport.initialize();

const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));

app.use(bodyParser.json());

let visit = 0;

app.get('/', (req, res) => {
  res.json({ message: 'Hello' });
});

app.get('/home', (req, res) => {
  visit += 1;
  res.json({ message: 'server OK!' });
});

app.get('/student', async (req, res) => {
  const client = await pool.connect(); // 함수 결과값 : Promist<pg.PoolClient>

  // req.query.id 값에 따른 return 값
  // 1) 값이 있을 경우 해당하는 데이터를 return
  if (req.query.id) {
    // 방법 1. for 문
    /*
      const result = await client.query('SELECT * FROM student');
      for (let i = 0; i < result.rows.length; i++) {
        if (result.rows[i].id === req.query.id) {
          res.json(result.rows[i]);
          break;
        }
      }
    */

    // 방법 2. query
    /*
      const result = await client.query(
        `SELECT * FROM student WHERE id = '${req.query.id}'`
      );
      res.json(result.rows[0]);
    */

    // 방법 3. query
    const result = await client.query('SELECT * FROM student WHERE id = $1', [
      req.query.id,
    ]);
    res.json(result.rows[0]);
  }
  // 2) 값이 없을 경우 전체 데이터를 return
  else {
    const result = await client.query('SELECT * FROM student');
    res.json(result.rows);
  }
  client.release();
});

// login API
app.post('/login', (req, res, next) => {
  // session 사용하지 않도록 임시 설정
  passport.authenticate('local', { session: false }, (err, user) => {
    if (!user) {
      res.status(403).send('Login Failed');
    }
    const token = jwt.sign(user, '1f$8as01n&1f@8as0px&');
    return res.json({ user, token });
  })(req, res);
});

// 데이터 추가 API
app.post('/student', async (req, res) => {
  const client = await pool.connect();

  // 중복된 id 일 경우 (db에 이미 데이터가 존재할 경우) insert 생략할 수 있도록
  const idCheck = await client.query('SELECT * FROM student WHERE id = $1', [
    req.body.id,
  ]);
  // 중복된 id 없을 경우 insert query
  if (idCheck.rowCount == 0) {
    const result = await client.query(
      'INSERT INTO student (id, gpa, name, major) VALUES ($1, $2, $3, $4)',
      [req.body.id, req.body.gpa, req.body.name, req.body.major]
    );
    res.json(result.rows);
  }
  // 중복된 id 있을 경우 update query
  else {
    const result = await client.query(
      'UPDATE student SET gpa = $1, name = $2, major = $3 WHERE id = $4',
      [req.body.gpa, req.body.name, req.body.major, req.body.id]
    );
    res.json(result.rows);
  }
  client.release();
});

// 데이터 삭제 API
app.delete('/student', async (req, res) => {
  const id = req.query.id;
  const client = await pool.connect();

  const result = await client.query('DELETE FROM student WHERE id = $1', [id]);
  res.json('delete success!');
  client.release();
});

app.get('/show', (req, res) => {
  res.json({ message: `${visit} 회` });
});

app.listen(5000, () => {
  console.log('server open!');
});
