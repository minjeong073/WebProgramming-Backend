import express from 'express'; // module 로 가져오는 방식
// const express = require('express'); // commonJS 로 가져오는 방식
import pg from 'pg'; // DB 연결하기 위한 방식 1) connection, 2) connection pool
// instance와 server 연결하는 방법

const app = express();
const pool = new pg.Pool({
  host: 'database-1.curpzbnv2b39.ap-northeast-2.rds.amazonaws.com',
  user: 'postgres',
  password: 'seren*7631',
  database: 'postgres',
});

// console.log(result);
// console.log(result.rows);

let visit = 0;

app.get('/', (req, res) => {
  res.json({ message: 'Hello' });
});

app.get('/home', (req, res) => {
  visit += 1;
  res.json({ message: 'server OK!' });
});

app.get('/student', async (req, res) => {
  const client = await pool.connect();
  const result = await client.query('SELECT * FROM student');
  res.json(result.rows);
  client.release();
});

app.get('/show', (req, res) => {
  res.json({ message: `${visit} 회` });
});

app.listen(5000, () => {
  console.log('server open!');
});
