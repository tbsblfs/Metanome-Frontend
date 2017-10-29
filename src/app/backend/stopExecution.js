'use strict';

export default ['$resource', 'ENV_VARS',
    function ($resource, ENV_VARS) {
      return $resource(ENV_VARS.API + '/api/algorithm-execution/stop/:identifier', {}, {
        stop: {
          method: 'POST',
          params: {
            identifier: '@identifier'
          }
        }
      });
    }
  ];
