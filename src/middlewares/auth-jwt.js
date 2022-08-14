import jwt from 'jsonwebtoken';

export const authenticatedJWT = (req, res, next) => {
  // headers.authorization == Bearer [JWT_TOKEN]
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.TOKEN_KEY, (err, user) => {
      err && res.status(403).json('Token is not valid.');
      console.log('verify user: ', user);
      req.user = user;
      next();
    });
  } else {
    res.status(401).json('Authenticating failed.');
  }
};
