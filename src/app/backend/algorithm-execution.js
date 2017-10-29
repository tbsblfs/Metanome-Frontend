'use strict';

export default ['$resource', 'ENV_VARS',
  function($resource, ENV_VARS) {
    return $resource(ENV_VARS.API + '/api/algorithm-execution', {}, {
      run: {
        method: 'POST'
      }
    });
  }
];
