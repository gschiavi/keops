// Generated by CoffeeScript 1.10.0
(function() {
  var Action, ReportAction, WindowAction,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Action = (function() {
    Action.prototype.actionType = null;

    function Action(info1, scope1) {
      this.info = info1;
      this.scope = scope1;
      this.location = this.scope.location;
    }

    Action.prototype.apply = function() {};

    Action.prototype.execute = function(scope) {};

    return Action;

  })();

  WindowAction = (function(superClass) {
    extend(WindowAction, superClass);

    WindowAction.actionType = 'sys.action.window';

    function WindowAction(info, scope) {
      WindowAction.__super__.constructor.call(this, info, scope);
      this.viewMode = info.view_mode;
      this.viewModes = this.viewMode.split(',');
      this.viewType = null;
    }

    WindowAction.prototype.createNew = function() {
      this.setViewType('form');
      return this.scope.dataSource.newRecord();
    };

    WindowAction.prototype.deleteSelection = function() {
      var i;
      if (confirm(Katrid.i18n.gettext('Confirm delete record?'))) {
        this.scope.model.destroy(this.scope.record.id);
        i = this.scope.records.indexOf(this.scope.record);
        if (i) {
          this.scope.dataSource.search({});
        }
        return this.setViewType('list');
      }
    };

    WindowAction.prototype.routeUpdate = function(search) {
      var filter;
      if (search.view_type != null) {
        if (this.scope.records == null) {
          this.scope.records = [];
        }
        if (this.viewType !== search.view_type) {
          this.scope.dataSource.pageIndex = null;
          this.scope.record = null;
          this.viewType = search.view_type;
          this.execute();
        }
        if (search.view_type === 'list' && !search.page) {
          this.location.search('page', 1);
          return;
        }
        filter = {};
        if (search.q != null) {
          filter.q = search.q;
        }
        if (search.view_type === 'list' && search.page !== this.scope.dataSource.pageIndex) {
          this.scope.dataSource.pageIndex = parseInt(search.page);
          this.scope.dataSource.search(filter, search.page);
        } else if (search.view_type === 'list' && (search.q != null)) {
          this.scope.dataSource.search(filter, search.page);
        }
        if (search.id && (((this.scope.record != null) && this.scope.record.id !== search.id) || (this.scope.record == null))) {
          this.scope.record = null;
          return this.scope.dataSource.get(search.id);
        }
      } else {
        return this.setViewType(this.viewModes[0]);
      }
    };

    WindowAction.prototype.setViewType = function(viewType) {
      return this.location.search({
        view_type: viewType
      });
    };

    WindowAction.prototype.apply = function() {
      return this.render(this.scope, this.scope.view.content, this.viewType);
    };

    WindowAction.prototype.execute = function() {
      var r;
      if (this.views != null) {
        this.scope.view = this.views[this.viewType];
        return this.apply();
      } else {
        r = this.scope.model.loadViews();
        r.done((function(_this) {
          return function(res) {
            var views;
            views = res.result;
            _this.views = views;
            return _this.scope.$apply(function() {
              _this.scope.views = views;
              _this.scope.view = views[_this.viewType];
              return _this.apply();
            });
          };
        })(this));
        return r;
      }
    };

    WindowAction.prototype.render = function(scope, html, viewType) {
      return scope.setContent(Katrid.UI.Utils.Templates['preRender_' + viewType](scope, html));
    };

    WindowAction.prototype.searchText = function(q) {
      return this.location.search('q', q);
    };

    WindowAction.prototype._prepareParams = function(params) {
      var j, len, p, r;
      r = {};
      for (j = 0, len = params.length; j < len; j++) {
        p = params[j];
        if (p.field && p.field.type === 'ForeignKey') {
          r[p.field.name] = p.id;
        } else {
          r[p.id.name + '__icontains'] = p.text;
        }
      }
      return r;
    };

    WindowAction.prototype.setSearchParams = function(params) {
      var data;
      data = this._prepareParams(params);
      return this.scope.dataSource.search(data);
    };

    WindowAction.prototype.doViewAction = function(viewAction, target, confirmation) {
      if (!confirmation || (confirmation && confirm(confirmation))) {
        return this.scope.model.doViewAction({
          action_name: viewAction,
          target: target
        }).done(function(res) {
          var j, k, len, len1, msg, ref, ref1, results, results1;
          console.log(res);
          if (res.status === 'open') {
            return window.open(res.open);
          } else if (res.status === 'fail') {
            ref = res.messages;
            results = [];
            for (j = 0, len = ref.length; j < len; j++) {
              msg = ref[j];
              results.push(Katrid.Dialogs.Alerts.error(msg));
            }
            return results;
          } else if (res.status === 'ok' && res.result.messages) {
            ref1 = res.result.messages;
            results1 = [];
            for (k = 0, len1 = ref1.length; k < len1; k++) {
              msg = ref1[k];
              results1.push(Katrid.Dialogs.Alerts.success(msg));
            }
            return results1;
          }
        });
      }
    };

    return WindowAction;

  })(Action);

  ReportAction = (function(superClass) {
    extend(ReportAction, superClass);

    function ReportAction() {
      return ReportAction.__super__.constructor.apply(this, arguments);
    }

    ReportAction.actionType = 'sys.action.report';

    ReportAction.prototype.routeUpdate = function(search) {
      return this.scope.setContent(this.info.content);
    };

    return ReportAction;

  })(Action);

  this.Katrid.Actions = {
    Action: Action,
    WindowAction: WindowAction,
    ReportAction: ReportAction
  };

  this.Katrid.Actions[WindowAction.actionType] = WindowAction;

  this.Katrid.Actions[ReportAction.actionType] = WindowAction;

}).call(this);

//# sourceMappingURL=actions.js.map
