import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import compression from 'compression';
import helmet from 'helmet';
import mongoose from 'mongoose';
import chalk from 'chalk';
import bodyParser from 'body-parser';

// errors handling middleware
import { notFound, badRequest } from './middlewares/exceptions.js';

const app = express();

// var dev_db_url =
//   'mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true';

// NOTE: @=%40 for MONGODB_URI
var dev_db_url =
  'mongodb+srv://cudayanh:%40kien12a99@cluster0.dkvtima.mongodb.net/local_library?retryWrites=true&w=majority';

var mongoDB = process.env.MONGODB_URI || dev_db_url;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.once('open', () =>
  console.info(chalk.hex('#009688')(' [*] Mongo: Connection Succeeded.'))
);
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// view engine setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());
app.use(compression()); // Compress all routes

/**
 * for TEMPLATE_ENGINE
 */
// app.use(express.static(path.join(__dirname, 'public')));

// REST API endpoints
import routes from './core/rest.js';

/**
 * /api로 들어오면 routes(노선) 실행
 * 실제 api 호출 후 매칭되는 주소를 통해서 이벤트 실행
 */
app.use('/api', routes);


app.use(notFound);
app.use(badRequest);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
});

// module.exports = app;
export default app;
