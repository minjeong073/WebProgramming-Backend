import express from 'express'; // module 로 가져오는 방식
// const express = require('express'); // commonJS 로 가져오는 방식

const app = express();

let visit  = 0;

app.get('/', (req, res) => {
  res.json({ message: 'Hello' });
});

app.get('/home', (req, res) => {
  visit += 1;
  res.json({ message: 'server OK!' });
});

app.get('/show', (req, res) => {
  res.json({message: `${visit} 회`});
});

app.listen(5000, () => {
  console.log('server open!');
});
