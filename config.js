const Confidence = require('confidence');
const criteria = { env: process.env.NODE_ENV };

const config = {
  '$meta': 'This file configures the server.',

  'server': {
    'port': process.env.PORT || 3000,
    'load': {
      'sampleInterval': {
        '$filter': 'env',
        'production': 0,
        'test': 0,
        '$default': 1000
      }
    },
    'enforceEncryption': {
      '$filter': 'env',
      'production': true,
      '$default': false
    }
  },

  'http': {
    'timeout': 10000
  },

  'auth': {
    'bell': {
      $filter: 'env',
      'production': {
        'google': {
          'clientId': process.env.GOOGLE_CLIENT_ID,
          'clientSecret': process.env.GOOGLE_CLIENT_SECRET,
          'isSecure': true
        }
      },
      '$default': {
        'google': {
          // NOTE: these values are throw away, development usage only!
          'clientId': '878341288548-7n56861l1fo3mgju8sep0ns2uq1nvtu0.apps.googleusercontent.com',
          'clientSecret': '2A1ccPJr2F7Z2K0XIuZAQOWu',
          'isSecure': false
        }
      }
    },
    'session': {
      '$filter': 'env',
      'production': {
        'password': process.env.AUTH_SESSION_PASSWORD,
        'isSecure': true
      },
      '$default': {
        'password': 'foo123',
        'isSecure': false,
        'cookie': `sid-${require('./package.json').name}`
      }
    }
  },

  'app': {
    $filter: 'env',
    production: {
      'restrictedDomain': process.env.RESTRICTED_DOMAIN,
      'upstreamAuth': {
        'username': process.env.UPSTREAM_USERNAME,
        'password': process.env.UPSTREAM_PASSWORD
      }
    },
    $default: {
      'restrictedDomain': 'gmail.com',
      'upstreamAuth': {
        'username': 'basic',
        'password': 'auth'
      }
    }
  }
};

// ---

const store = new Confidence.Store(config);

exports.store = store;

exports.get = function (key) {

  return store.get(key, criteria);
};


// exports.meta = function (key) {

//   return store.meta(key, criteria);
// };
