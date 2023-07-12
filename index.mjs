import express from 'express'; // module 로 가져오는 방식
// const express = require('express'); // commonJS 로 가져오는 방식
import pg from 'pg'; // DB 연결하기 위한 방식 1) connection, 2) connection pool
// instance와 server 연결하는 방법

const app = express();
const pool = new pg.Pool({
  host: 'ls-36013ca3bc63e5519bfd9d3387a46189c9b13beb.cnankpeeqn4z.ap-northeast-2.rds.amazonaws.com',
  user: 'dbmasteruser',
  password: '^K%idJElimf&NnyC!W[_6f2hVm1F%c;}',
  database: 'postgres',
});

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

app.get('/show', (req, res) => {
  res.json({ message: `${visit} 회` });
});

app.listen(5000, () => {
  console.log('server open!');
});
