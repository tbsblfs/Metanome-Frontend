'use strict';

export default ['$resource', 'ENV_VARS',
  function($resource, ENV_VARS) {
    return $resource(ENV_VARS.API + '/api/result-store/count/:type', {}, {
      get: {
        method: 'GET',
        params: {
          type: '@type'
        }
      }
    });
  }
];
