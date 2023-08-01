import bodyParser from 'body-parser';
import express from 'express';
import passport from 'passport';
import localPass from 'passport-local';
import jwtPass from 'passport-jwt';
import jwt from 'jsonwebtoken';

const app = express();

app.use(bodyParser.json());

// 다른 함수에서 토큰을 이용한 인증을 사용할 수 있도록 설정
passport.use(
  'jwt',
  new jwtPass.Strategy(
    {
      jwtFromRequest: jwtPass.ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'secret',
    },
    (jwt_payload, done) => {
      done(null, {
        id: jwt_payload.id,
      });
    }
  )
);

// 처음 로그인 할 때 사용되는 함수
passport.use(
  'local',
  new localPass.Strategy(
    { usernameField: 'userId', passwordField: 'password' },
    (username, password, done) => {
      if (username === 'admin' && password === 'admin') {
        return done(null, { username });
      }
      return done(null, false, { reason: 'Invalid username or password' });
    }
  )
);

app.use(passport.initialize());

// 로그인 안 해도 사용할 수 있는 함수
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// 로그인 정보를 받아서 토큰 결과를 제공하는 함수
app.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err || !user) {
      return next(err);
    }
    if (info) {
      return res.status(410).send(info.reason);
    }
    return req.login(user, { session: false }, (loginErr) => {
      if (loginErr) {
        return next(loginErr);
      }
      const token = jwt.sign({ id: user.username }, 'secret');
      return res.json({ token: token });
    });
  })(req, res, next);
});

// 토큰을 이용한 인증
app.get(
  '/login_check',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.json(`로그인한 아이디 정보 ${req.user.id}`);
  }
);

// 서버 실행
app.listen(5000, () => {
  console.log('Server is listening on port 5000');
});
