'use strict';

export default ['$resource', 'ENV_VARS',
    function ($resource, ENV_VARS) {
      return $resource(ENV_VARS.API + '/api/algorithms/:type', {}, {
        get: {
          method: 'GET',
          params: {
            type: '@type'
          }, isArray: true
        }
      });
    }
  ];
