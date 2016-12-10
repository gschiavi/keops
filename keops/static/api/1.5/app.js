// Generated by CoffeeScript 1.10.0
(function() {
  var ngApp;

  ngApp = angular.module('katridApp', ['ngRoute', 'ngCookies', 'ngSanitize', 'ui-katrid']);

  ngApp.config(function($interpolateProvider) {
    $interpolateProvider.startSymbol('${');
    return $interpolateProvider.endSymbol('}');
  });

  ngApp.factory('actions', function() {
    return {
      get: function(id) {
        return $.get('/web/action/' + id + '/');
      }
    };
  });

  ngApp.config(function($routeProvider) {
    $routeProvider.when('/action/:actionId', {
      controller: 'ActionController',
      reloadOnSearch: false,
      resolve: {
        action: [
          'actions', '$route', function(actions, $route) {
            return actions.get($route.current.params.actionId);
          }
        ]
      },
      template: "<div id=\"katrid-action-view\">" + (Katrid.i18n.gettext('Loading...')) + "</div>"
    });
  });

  ngApp.controller('BasicController', function($scope, $compile, $location) {
    $scope.compile = $compile;
    return $scope.Katrid = Katrid;
  });

  ngApp.controller('ActionController', function($scope, $compile, action, $location) {
    var init;
    $scope.data = null;
    $scope.record = null;
    $scope.recordIndex = null;
    $scope.records = null;
    $scope.viewType = null;
    $scope.recordCount = 0;
    $scope.dataSource = new Katrid.Data.DataSource($scope);
    $scope.compile = $compile;
    $scope.$on('$routeUpdate', function() {
      return $scope.action.routeUpdate($location.$$search);
    });
    $scope.setContent = function(content) {
      $scope.content = content;
      return angular.element('#katrid-action-view').html($compile(content)($scope));
    };
    init = function(action) {
      var act;
      if (action) {
        $scope.model = new Katrid.Services.Model(action.model[1]);
        $scope.action = act = new Katrid.Actions[action.action_type](action, $scope, $location);
        return act.routeUpdate($location.$$search);
      }
    };
    return init(action);
  });

  this.Katrid.ngApp = ngApp;

}).call(this);

//# sourceMappingURL=app.js.map
