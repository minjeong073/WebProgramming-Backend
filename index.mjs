import express from 'express'; // module 로 가져오는 방식
// const express = require('express'); // commonJS 로 가져오는 방식

const app = express();

app.get('/', (req, res) => {
  res.json({ message: 'Hello' });
});

app.listen(5000, () => {
  console.log('server open!');
});
