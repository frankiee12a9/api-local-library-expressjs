import chalk from 'chalk';
import expressValidation from 'express-validation';
import ApiError from '../shared/api-error.js';
import httpStatus from 'http-status';

export const notFound = (req, rest, next) => {
  const err = new ApiError('API 찾을 수 없음', httpStatus.NOT_FOUND, true);
  console.info(chalk.hex('#ff0000')('[NOT_FOUND]', err));
  return next(err);
};

export const badRequest = (err, req, res, next) => {
  console.info(chalk.hex('#ff0000')('[BAD_REQUEST]', JSON.stringify(err)));
  if (err instanceof expressValidation.ValidationError) {
    // 검증 오류 취합
    const unifiedErrorMessage = err.errors
      .map((error) => error.messages.join('. '))
      .join(' and ');
    const error = new ApiError(unifiedErrorMessage, err.status, true);
    return next(error);
  } else if (!(err instanceof ApiError)) {
    return next(err);
  }
  return next(err);
};
