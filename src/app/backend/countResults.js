'use strict';

export default ['$http', 'ENV_VARS',
  function($http, ENV_VARS) {
    return {
      get: function(type) {
        return $http.get(ENV_VARS.API + '/api/result-store/count/' + type);
      }
    };
  }
];
