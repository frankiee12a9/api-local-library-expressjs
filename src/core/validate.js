import chalk from 'chalk';

export const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  console.info(chalk.hex('#ff0000')('[BAD_REQUEST]', error));
  if (error) {
    // res.status(422).send(error.details[0].message);
    res.status(422).send(error.details);
  } else {
    next();
  }
};
