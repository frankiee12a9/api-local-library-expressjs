// package.json

"start": "NODE_OPTIONS='--experimental-specifier-resolution=node' node ./bin/www",
"devstart": "nodemon ./bin/www",
"test": "cross-env NODE_ENV=test jest \"src/.*\\.js$\" --coverage --forceExit",
"serverstart": "DEBUG=local_library:* npm run devstart"


