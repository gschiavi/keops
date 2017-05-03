// Generated by CoffeeScript 1.10.0
(function() {
  var Action, ReportAction, ViewAction, WindowAction,
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

    WindowAction.prototype.copy = function() {
      this.setViewType('form');
      this.scope.dataSource.copy(this.scope.record.id);
      return false;
    };

    WindowAction.prototype.routeUpdate = function(search) {
      var fields, filter, ref, ref1, ref2;
      if (search.view_type != null) {
        if (this.scope.records == null) {
          this.scope.records = [];
        }
        if (this.viewType !== search.view_type) {
          this.scope.dataSource.pageIndex = null;
          this.scope.record = null;
          this.viewType = search.view_type;
          this.execute();
          return;
        }
        if (((ref = search.view_type) === 'list' || ref === 'card') && !search.page) {
          this.location.search('page', 1);
        } else {
          filter = {};
          if (search.q != null) {
            filter.q = search.q;
          }
          fields = _.keys(this.scope.view.fields);
          if (((ref1 = search.view_type) === 'list' || ref1 === 'card') && search.page !== this.scope.dataSource.pageIndex) {
            this.scope.dataSource.pageIndex = parseInt(search.page);
            this.scope.dataSource.search(filter, search.page, fields);
          } else if (((ref2 = search.view_type) === 'list' || ref2 === 'card') && (search.q != null)) {
            this.scope.dataSource.search(filter, search.page, fields);
          }
          if (search.id && (((this.scope.record != null) && this.scope.record.id !== search.id) || (this.scope.record == null))) {
            console.log('set id', search.id);
            this.scope.record = null;
            this.scope.dataSource.get(search.id);
          }
        }
      } else {
        this.setViewType(this.viewModes[0]);
      }
    };

    WindowAction.prototype.setViewType = function(viewType) {
      return this.location.search({
        view_type: viewType
      });
    };

    WindowAction.prototype.apply = function() {
      this.render(this.scope, this.scope.view.content, this.viewType);
      return this.routeUpdate(this.location.$$search);
    };

    WindowAction.prototype.execute = function() {
      var r;
      if (this.views != null) {
        this.scope.view = this.views[this.viewType];
        this.apply();
      } else {
        r = this.scope.model.loadViews({
          views: this.info.views,
          action: this.info.id
        });
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
      }
      if (this.viewType !== 'list') {
        return this.scope.dataSource.groupBy();
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
      return this.scope.dataSource.search(params);
    };

    WindowAction.prototype.applyGroups = function(groups) {
      return this.scope.dataSource.groupBy(groups[0]);
    };

    WindowAction.prototype.doViewAction = function(viewAction, target, confirmation, prompt) {
      return this._doViewAction(this.scope, viewAction, target, confirmation, prompt);
    };

    WindowAction.prototype._doViewAction = function(scope, viewAction, target, confirmation, prompt) {
      var promptValue;
      promptValue = null;
      if (prompt) {
        promptValue = window.prompt(prompt);
      }
      if (!confirmation || (confirmation && confirm(confirmation))) {
        return scope.model.doViewAction({
          action_name: viewAction,
          target: target,
          prompt: promptValue
        }).done(function(res) {
          var j, k, len, len1, msg, ref, ref1, results, results1;
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

    WindowAction.prototype.listRowClick = function(index, row) {
      if (row._group) {
        row._group.expanded = !row._group.expanded;
        row._group.collapsed = !row._group.expanded;
        if (row._group.expanded) {
          return this.scope.dataSource.expandGroup(index, row);
        } else {
          return this.scope.dataSource.collapseGroup(index, row);
        }
      } else {
        this.scope.dataSource.setRecordIndex(index);
        return this.location.search({
          view_type: 'form',
          id: row.id
        });
      }
    };

    WindowAction.prototype.autoReport = function() {
      return this.scope.model.autoReport().done(function(res) {
        if (res.ok && res.result.open) {
          return window.open(res.result.open);
        }
      });
    };

    return WindowAction;

  })(Action);

  ReportAction = (function(superClass) {
    extend(ReportAction, superClass);

    ReportAction.actionType = 'sys.action.report';

    function ReportAction(info, scope) {
      ReportAction.__super__.constructor.call(this, info, scope);
      this.userReport = {};
    }

    ReportAction.prototype.userReportChanged = function(report) {
      return this.location.search({
        user_report: report
      });
    };

    ReportAction.prototype.routeUpdate = function(search) {
      var svc;
      console.log('report action', this.info);
      this.userReport.id = search.user_report;
      if (this.userReport.id) {
        svc = new Katrid.Services.Model('sys.action.report');
        svc.post('load_user_report', null, {
          kwargs: {
            user_report: this.userReport.id
          }
        }).done((function(_this) {
          return function(res) {
            _this.userReport.params = res.result;
            return _this.scope.setContent(_this.info.content);
          };
        })(this));
      } else {
        this.scope.setContent(Katrid.Reports.Reports.renderDialog(this));
      }
    };

    return ReportAction;

  })(Action);

  ViewAction = (function(superClass) {
    extend(ViewAction, superClass);

    function ViewAction() {
      return ViewAction.__super__.constructor.apply(this, arguments);
    }

    ViewAction.actionType = 'sys.action.view';

    ViewAction.prototype.routeUpdate = function(search) {
      return this.scope.setContent(this.info.content);
    };

    return ViewAction;

  })(Action);

  this.Katrid.Actions = {
    Action: Action,
    WindowAction: WindowAction,
    ReportAction: ReportAction,
    ViewAction: ViewAction
  };

  this.Katrid.Actions[WindowAction.actionType] = WindowAction;

  this.Katrid.Actions[ReportAction.actionType] = ReportAction;

  this.Katrid.Actions[ViewAction.actionType] = ViewAction;

}).call(this);

//# sourceMappingURL=actions.js.map
