import moment from 'moment';
import mongoose from 'mongoose';

function smartQueryPlugin(schema, options = {}) {
  schema.statics.smartQuery = function (queryParams, cb) {
    let params = this.smartQueryParams(queryParams);
    let query = this.find(params.searchParams, params.projection)
      .limit(params.limit)
      .skip((params.page - 1) * params.limit);

    if (params.sort) query = query.sort(params.sort);
    if (cb) {
      query.exec(cb);
    } else {
      return query;
    }
  };

  schema.statics.smartCount = function (queryParams, cb) {
    let params = this.smartQueryParams(queryParams);
    let query = this.countDocuments(params.searchParams);

    if (cb) {
      query.exec(cb);
    } else {
      return query;
    }
  };

  schema.statics.smartQueryOne = function (queryParams, cb) {
    let project = options.defaultProject || '';
    for (let key in queryParams) {
      if (key === 'fields') {
        let operator = queryParams[key].match(/\{(.*)\}/);
        let value = queryParams[key].replace(/\{(.*)\}/, '');
        project = operator && operator[1] === 'all' ? '' : value;
      }
    }

    let query = this.findOne({ _id: queryParams.id }, project);
    if (cb) {
      query.exec(cb);
    } else {
      return query;
    }
  };

  schema.statics.smartQueryParams = function (queryParams) {
    let model = this;
    let params = {
      page: 1,
      sort: '-_id',
      projection: options.defaultProject || '',
      searchParams: {},
      limit: options.limit || 10,
    };

    function parseParam(key, val) {
      let lcKey = key.replace(/\-/g, '.');
      let operator = val.match(/\{(.*)\}/);
      val = val.replace(/\{(.*)\}/, '');

      if (operator) operator = operator[1];
      if (val) {
        switch (lcKey) {
          case 'page':
            params.page = parseInt(val, 10);
            break;
          case 'limit':
            params.limit = parseInt(val, 10);
            break;
          case 'sort':
            params.sort = val;
            break;
          case 'fields':
            params.projection = val;
            break;
          case 'q':
            let fields = options.fieldsForQuery.split(' ');
            let regex = { $regex: new RegExp(val, 'i') };
            params.searchParams.$or = fields.map((field) => {
              return { [`${field}`]: regex };
            });
            break;
          default:
            parseSchemaForKey(model.schema, '', lcKey, val, operator);
        }
      }
    }

    function parseSchemaForKey(schema, keyPrefix, lcKey, val, operator) {
      var paramType = false;

      function addSearchParam(val) {
        var key = keyPrefix + lcKey;
        if (typeof params.searchParams[key] !== 'undefined') {
          if (Array.isArray(val)) {
            for (i in val) {
              params.searchParams[key][i] = val[i];
            }
          } else {
            if (params.searchParams.hasOwnProperty(key)) {
              params.searchParams[key] = {
                ...params.searchParams[key],
                ...val,
              };
              console.log(params.searchParams[key]);
            } else {
              params.searchParams[key] = val;
            }
          }
        } else {
          if (params.searchParams.hasOwnProperty(key)) {
            params.searchParams[key] = { ...params.searchParams[key], val };
          } else {
            params.searchParams[key] = val;
          }
        }
      }

      let matches = lcKey.match(/(.+)\.(.+)/);
      if (matches) {
        if (schema.paths[matches[1]]) {
          let name = schema.paths[matches[1]].constructor.name;
          if (['DocumentArray', 'SchemaType', 'Mixed'].includes(name)) {
            let subschema = schema.paths[matches[1]].schema;
            parseSchemaForKey(
              subschema,
              `${matches[1]}.`,
              matches[2],
              val,
              operator
            );
          }
        }
      } else if (typeof schema === 'undefined') {
        paramType = 'String';
      } else if (typeof schema.paths[lcKey] === 'undefined') {
      } else if (operator === 'near') {
        paramType = 'Near';
      } else {
        paramType = getParamType(schema.paths[lcKey].constructor.name);
      }

      switch (paramType) {
        case 'Boolean':
          addSearchParam(convertToBoolean(val));
          break;
        case 'Number':
          addSearchParam(getNumberParam(val, operator));
          break;
        case 'String':
          addSearchParam(getStringParam(val, operator));
          break;
        case 'Near':
          addSearchParam(getNearParam(val));
          break;
        case 'ObjectId':
          if (operator === 'size') {
            addSearchParam(addSizeParam(val));
          } else if (operator === 'in') {
            if (val.split(',').length > 1) {
              addSearchParam(getObjectParam(val, operator));
            } else {
              addSearchParam(mongoose.Types.ObjectId(val));
            }
          } else {
            addSearchParam(mongoose.Types.ObjectId(val));
          }
          break;
        case 'Array':
          if (operator === 'size') {
            addSearchParam(addSizeParam(val));
          } else {
            addSearchParam(val);
          }
          //addSearchParam(val);
          break;
        case 'DocumentArray':
          addSearchParam(getArrayParam(val, operator));
          break;
        case 'Date':
          addSearchParam(getDateParam(val, operator));
          break;
      }
    }

    for (var key in queryParams) {
      var separatedParams = queryParams[key].match(/\{\w+\}(.[^\{\}]*)/g);
      if (separatedParams === null) {
        parseParam(key, queryParams[key]);
      } else {
        for (var i = 0, len = separatedParams.length; i < len; ++i) {
          parseParam(key, separatedParams[i]);
        }
      }
    }
    return params;
  };
}

function convertToBoolean(str) {
  return ['true', 't', 'yes', 'y', '1'].includes(str.toLowerCase());
}

function getParamType(param) {
  switch (param) {
    case 'SchemaBoolean':
      return 'Boolean';
    case 'SchemaString':
      return 'String';
    case 'SchemaNumber':
      return 'Number';
    case 'ObjectId':
      return 'ObjectId';
    case 'SchemaArray':
      return 'Array';
    case 'SchemaDate':
      return 'Date';
    default:
      return param;
  }
}

function addSizeParam(val) {
  return { $size: val };
}

function getNumberParam(val, operator) {
  if (val.match(/([0-9]+,?)/) && val.match(',')) {
    switch (operator) {
      case 'all':
        return { $all: val.split(',') };
      case 'nin':
        return { $nin: val.split(',') };
      case 'mod':
        return { $mod: [val.split(',')[0], val.split(',')[1]] };
      default:
        return { $in: val.split(',') };
    }
  } else if (val.match(/([0-9]+)/)) {
    if (['gt', 'gte', 'lt', 'lte', 'ne'].includes(operator)) {
      var newParam = {};
      newParam['$' + operator] = val;
      return newParam;
    } else {
      return parseInt(val);
    }
  }
}

function getObjectParam(val, operator) {
  if (val.match(',')) {
    let options = val.split(',');
    //.map(str => RegExp(str, 'i'));
    options.map((value) => mongoose.Types.ObjectId(value));

    switch (operator) {
      case 'all':
        return { $all: options };
      case 'nin':
        return { $nin: options };
      default:
        return { $in: options };
    }
  }
}

function getStringParam(val, operator) {
  if (val.match(',')) {
    let options = val.split(',').map((str) => RegExp(str, 'i'));
    switch (operator) {
      case 'all':
        return { $all: options };
      case 'nin':
        return { $nin: options };
      default:
        return { $in: options };
    }
  } else if (val.match(/^-?\d+\.?\d*$/)) {
    if (['gt', 'gte', 'lt', 'lte'].includes(operator)) {
      var newParam = {};
      newParam['$' + operator] = val;
      return newParam;
    } else {
      return {
        $regex: val,
        $options: '-i',
      };
    }
  } else if (operator === 'ne' || operator === 'not') {
    var neregex = new RegExp(val, 'i');
    return { $not: neregex };
  } else if (operator === 'exact') {
    return val;
  } else {
    return {
      $regex: val,
      $options: '-i',
    };
  }
}

function getNearParam(val) {
  var latlng = val.split(',');
  var distObj = { $near: [parseFloat(latlng[0]), parseFloat(latlng[1])] };
  if (typeof latlng[2] !== 'undefined') {
    distObj.$maxDistance = parseFloat(latlng[2]) / 69;
  }
  return distObj;
}

function getArrayParam(val, operator) {
  if (val.match(',')) {
    let options = val
      .split(',')
      .map((str) => {
        const c = str.split(':');
        return c;
      })
      .reduce((obj, item) => {
        obj[item[0]] = item[1];
        return obj;
      }, {});
    switch (operator) {
      case 'match':
        return { $elemMatch: options };
      default:
        return { $elemMatch: options };
    }
  }
}

function getDateParam(val, operator) {
  if (val.match(',')) {
    let options = val
      .split(',')
      .map((str) => moment(str, 'YYYY-MM-DD'))
      .toDate();
    switch (operator) {
      case 'all':
        return { $all: options };
      case 'nin':
        return { $nin: options };
      default:
        return { $in: options };
    }
  } else if (['gt', 'gte', 'lt', 'lte'].includes(operator)) {
    var newParam = {};
    console.log('val=>' + val);
    if (operator === 'gt' || operator === 'gte') {
      newParam['$' + operator] = moment(val, 'YYYY-MM-DD').toDate();
    } else {
      newParam['$' + operator] = moment(val, 'YYYY-MM-DD')
        .add(1, 'days')
        .toDate();
    }
    return newParam;
  } else if (operator === 'ne' || operator === 'not') {
    return { $not: moment(val, 'YYYY-MM-DD') };
  } else if (operator === 'exact') {
    return moment(val, 'YYYY-MM-DD').add(1, 'days').toDate();
  } else {
    return moment(val, 'YYYY-MM-DD').add(1, 'days').toDate();
  }
}

export default smartQueryPlugin;
