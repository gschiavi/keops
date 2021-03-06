// Generated by CoffeeScript 1.10.0
(function() {
  var Param, Params, Report, Reports, _counter, dtypeDict,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _counter = 0;

  Reports = (function() {
    function Reports() {}

    Reports.currentReport = {};

    Reports.currentUserReport = {};

    Reports.get = function(repName) {};

    Reports.renderDialog = function(action) {
      return Katrid.UI.Utils.Templates.renderReportDialog(action);
    };

    return Reports;

  })();

  Report = (function() {
    function Report(action1, scope1) {
      this.action = action1;
      this.scope = scope1;
      this.info = this.action.info;
      Katrid.Reports.Reports.currentReport = this;
      this.userReport = this.action.userReport;
      if (Params.Labels == null) {
        Params.Labels = {
          exact: Katrid.i18n.gettext('Is equal'),
          "in": Katrid.i18n.gettext('Selection'),
          contains: Katrid.i18n.gettext('Contains'),
          startswith: Katrid.i18n.gettext('Starting with'),
          endswith: Katrid.i18n.gettext('Ending with'),
          gt: Katrid.i18n.gettext('Greater-than'),
          lt: Katrid.i18n.gettext('Less-than'),
          between: Katrid.i18n.gettext('Between'),
          isnull: Katrid.i18n.gettext('Is Null')
        };
      }
      this.name = this.info.name;
      this.id = ++_counter;
      this.values = {};
      this.params = [];
      this.filters = [];
      this.groupables = [];
      this.sortables = [];
      this.totals = [];
    }

    Report.prototype.getUserParams = function() {
      var fields, grouping, i, len, p, params, ref, report, sorting, totals;
      report = this;
      params = {
        data: [],
        file: report.container.find('#id-report-file').val()
      };
      ref = this.params;
      for (i = 0, len = ref.length; i < len; i++) {
        p = ref[i];
        params.data.push({
          name: p.name,
          op: p.operation,
          value1: p.value1,
          value2: p.value2,
          type: p.type
        });
      }
      fields = report.container.find('#report-id-fields').val();
      params['fields'] = fields;
      totals = report.container.find('#report-id-totals').val();
      params['totals'] = totals;
      sorting = report.container.find('#report-id-sorting').val();
      params['sorting'] = sorting;
      grouping = report.container.find('#report-id-grouping').val();
      params['grouping'] = grouping;
      return params;
    };

    Report.prototype.loadFromXml = function(xml) {
      var f, fields, groupable, i, label, len, name, p, param, params, ref, sortable, total;
      if (_.isString(xml)) {
        xml = $(xml);
      }
      fields = [];
      ref = xml.find('field');
      for (i = 0, len = ref.length; i < len; i++) {
        f = ref[i];
        f = $(f);
        name = f.attr('name');
        label = f.attr('label') || (this.info.fields[name] && this.info.fields[name].caption) || name;
        groupable = f.attr('groupable');
        sortable = f.attr('sortable');
        total = f.attr('total');
        param = f.attr('param');
        fields.push({
          name: name,
          label: label,
          groupable: groupable,
          sortable: sortable,
          total: total,
          param: param
        });
      }
      params = (function() {
        var j, len1, ref1, results;
        ref1 = xml.find('param');
        results = [];
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          p = ref1[j];
          results.push($(p).attr('name'));
        }
        return results;
      })();
      return this.load(fields, params);
    };

    Report.prototype.saveDialog = function() {
      var name, params;
      params = this.getUserParams();
      name = window.prompt(Katrid.i18n.gettext('Report name'), this.userReport.name);
      if (name) {
        this.userReport.name = name;
        $.ajax({
          type: 'POST',
          url: this.container.find('#report-form').attr('action') + '?save=' + name,
          contentType: "application/json; charset=utf-8",
          dataType: 'json',
          data: JSON.stringify({
            report_id: this.info.report_id,
            params: params
          })
        });
      }
      return false;
    };

    Report.prototype.loadUserReport = function(id) {
      return this.action.location.search('user_report', id);
    };

    Report.prototype.load = function(fields, params) {
      var i, len, p, ref, results;
      if (!fields) {
        fields = this.info.fields;
      }
      if (!params) {
        params = [];
      }
      this.fields = fields;
      results = [];
      for (i = 0, len = fields.length; i < len; i++) {
        p = fields[i];
        if (p.groupable) {
          this.groupables.push(p);
        }
        if (p.sortable) {
          this.sortables.push(p);
        }
        if (p.total) {
          this.totals.push(p);
        }
        results.push(p.autoCreate = (ref = p.name, indexOf.call(params, ref) >= 0));
      }
      return results;
    };

    Report.prototype.loadParams = function() {
      var i, len, p, ref, results;
      ref = this.fields;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        p = ref[i];
        if (p.autoCreate) {
          results.push(this.addParam(p.name));
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    Report.prototype.addParam = function(paramName, value) {
      var i, len, p, ref, results;
      ref = this.fields;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        p = ref[i];
        if (p.name === paramName) {
          p = new Param(p, this);
          this.params.push(p);
          p.value1 = value[0];
          p.value2 = value[1];
          break;
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    Report.prototype.getValues = function() {};

    Report.prototype["export"] = function(format) {
      var params, svc;
      if (format == null) {
        format = 'pdf';
      }
      params = this.getUserParams();
      svc = new Katrid.Services.Model('sys.action.report');
      svc.post('export_report', null, {
        args: [this.info.report_id],
        kwargs: {
          format: format,
          params: params
        }
      }).done(function(res) {
        if (res.result.open) {
          return window.open(res.result.open);
        }
      });
      return false;
    };

    Report.prototype.preview = function() {
      return this["export"]();
    };

    Report.prototype.renderFields = function() {
      var aggs, el, flds, p, sel;
      el = $('<div></div>');
      flds = ((function() {
        var i, len, ref, results;
        ref = this.fields;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          p = ref[i];
          results.push("<option value=\"" + p.name + "\">" + p.label + "</option>");
        }
        return results;
      }).call(this)).join('');
      aggs = ((function() {
        var i, len, ref, results;
        ref = this.fields;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          p = ref[i];
          if (p.total) {
            results.push("<option value=\"" + p.name + "\">" + p.label + "</option>");
          }
        }
        return results;
      }).call(this)).join('');
      el = this.container.find('#report-params');
      sel = el.find('#report-id-fields');
      sel.append($(flds)).select2({
        tags: (function() {
          var i, len, ref, results;
          ref = this.fields;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            p = ref[i];
            results.push({
              id: p.name,
              text: p.label
            });
          }
          return results;
        }).call(this)
      }).select2("container").find("ul.select2-choices").sortable({
        containment: 'parent',
        start: function() {
          return sel.select2("onSortStart");
        },
        update: function() {
          return sel.select2("onSortEnd");
        }
      });
      if (this.userReport.id && this.userReport.params.fields) {
        console.log('load user params', this.userReport.params);
        sel.select2('val', this.userReport.params.fields);
      }
      sel = el.find('#report-id-totals');
      sel.append(aggs).select2({
        tags: (function() {
          var i, len, ref, results;
          ref = this.fields;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            p = ref[i];
            if (p.total) {
              results.push({
                id: p.name,
                text: p.label
              });
            }
          }
          return results;
        }).call(this)
      }).select2("container").find("ul.select2-choices").sortable({
        containment: 'parent',
        start: function() {
          return sel.select2("onSortStart");
        },
        update: function() {
          return sel.select2("onSortEnd");
        }
      });
      return el;
    };

    Report.prototype.renderParams = function(container) {
      var el, i, j, len, len1, loaded, p, ref, ref1;
      el = $('<div></div>');
      this.elParams = el;
      loaded = {};
      if (this.userReport.id && this.userReport.params.data) {
        ref = this.userReport.params.data;
        for (i = 0, len = ref.length; i < len; i++) {
          p = ref[i];
          loaded[p.name] = true;
          this.addParam(p.name, [p.value1, p.value2]);
        }
      }
      ref1 = this.params;
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        p = ref1[j];
        if (p["static"] && !loaded[p.name]) {
          $(p.render(el));
        }
      }
      return container.find('#params-params').append(el);
    };

    Report.prototype.renderGrouping = function(container) {
      var el, opts, p, sel;
      opts = ((function() {
        var i, len, ref, results;
        ref = this.groupables;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          p = ref[i];
          results.push("<option value=\"" + p.name + "\">" + p.label + "</option>");
        }
        return results;
      }).call(this)).join('');
      el = container.find("#params-grouping");
      sel = el.find('select').select2();
      return sel.append(opts).select2("container").find("ul.select2-choices").sortable({
        containment: 'parent',
        start: function() {
          return sel.select2("onSortStart");
        },
        update: function() {
          return sel.select2("onSortEnd");
        }
      });
    };

    Report.prototype.renderSorting = function(container) {
      var el, opts, p, sel;
      opts = ((function() {
        var i, len, ref, results;
        ref = this.sortables;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          p = ref[i];
          if (p.sortable) {
            results.push("<option value=\"" + p.name + "\">" + p.label + "</option>");
          }
        }
        return results;
      }).call(this)).join('');
      el = container.find("#params-sorting");
      sel = el.find('select').select2();
      return sel.append(opts).select2("container").find("ul.select2-choices").sortable({
        containment: 'parent',
        start: function() {
          return sel.select2("onSortStart");
        },
        update: function() {
          return sel.select2("onSortEnd");
        }
      });
    };

    Report.prototype.render = function(container) {
      var el;
      this.container = container;
      el = this.renderFields();
      if (this.sortables.length) {
        el = this.renderSorting(container);
      } else {
        container.find("#params-sorting").hide();
      }
      if (this.groupables.length) {
        el = this.renderGrouping(container);
      } else {
        container.find("#params-grouping").hide();
      }
      return el = this.renderParams(container);
    };

    return Report;

  })();

  Params = (function() {
    function Params() {}

    Params.Operations = {
      exact: 'exact',
      "in": 'in',
      contains: 'contains',
      startswith: 'startswith',
      endswith: 'endswith',
      gt: 'gt',
      lt: 'lt',
      between: 'between',
      isnull: 'isnull'
    };

    Params.DefaultOperations = {
      CharField: Params.Operations.exact,
      IntegerField: Params.Operations.exact,
      DateTimeField: Params.Operations.between,
      DateField: Params.Operations.between,
      FloatField: Params.Operations.between,
      DecimalField: Params.Operations.between,
      ForeignKey: Params.Operations.exact,
      sqlchoices: Params.Operations.exact
    };

    Params.TypeOperations = {
      CharField: [Params.Operations.exact, Params.Operations["in"], Params.Operations.contains, Params.Operations.startswith, Params.Operations.endswith, Params.Operations.isnull],
      IntegerField: [Params.Operations.exact, Params.Operations["in"], Params.Operations.gt, Params.Operations.lt, Params.Operations.between, Params.Operations.isnull],
      FloatField: [Params.Operations.exact, Params.Operations["in"], Params.Operations.gt, Params.Operations.lt, Params.Operations.between, Params.Operations.isnull],
      DecimalField: [Params.Operations.exact, Params.Operations["in"], Params.Operations.gt, Params.Operations.lt, Params.Operations.between, Params.Operations.isnull],
      DateTimeField: [Params.Operations.exact, Params.Operations["in"], Params.Operations.gt, Params.Operations.lt, Params.Operations.between, Params.Operations.isnull],
      DateField: [Params.Operations.exact, Params.Operations["in"], Params.Operations.gt, Params.Operations.lt, Params.Operations.between, Params.Operations.isnull],
      ForeignKey: [Params.Operations.exact, Params.Operations["in"], Params.Operations.isnull],
      sqlchoices: [Params.Operations.exact, Params.Operations["in"], Params.Operations.isnull]
    };

    Params.Widgets = {
      CharField: function(param) {
        return "<div><label class=\"control-label\">&nbsp;</label><input id=\"rep-param-id-" + param.id + "\" ng-model=\"param.value1\" type=\"text\" class=\"form-control\"></div>";
      },
      IntegerField: function(param) {
        var secondField;
        secondField = '';
        if (param.operation === 'between') {
          secondField = "<div class=\"col-xs-6\"><label class=\"control-label\">&nbsp;</label><input id=\"rep-param-id-" + param.id + "-2\" ng-model=\"param.value2\" type=\"text\" class=\"form-control\"></div>";
        }
        return "<div class=\"row\"><div class=\"col-sm-6\"><label class=\"control-label\">&nbsp;</label><input id=\"rep-param-id-" + param.id + "\" type=\"number\" ng-model=\"param.value1\" class=\"form-control\"></div>" + secondField + "</div>";
      },
      DecimalField: function(param) {
        var secondField;
        secondField = '';
        if (param.operation === 'between') {
          secondField = "<div class=\"col-xs-6\"><label class=\"control-label\">&nbsp;</label><input id=\"rep-param-id-" + param.id + "-2\" ng-model=\"param.value2\" type=\"text\" class=\"form-control\"></div>";
        }
        return "<div class=\"col-sm-6\"><label class=\"control-label\">&nbsp;</label><input id=\"rep-param-id-" + param.id + "\" type=\"number\" ng-model=\"param.value1\" class=\"form-control\"></div>" + secondField;
      },
      DateTimeField: function(param) {
        var secondField;
        secondField = '';
        if (param.operation === 'between') {
          secondField = "<div class=\"col-xs-6\"><label class=\"control-label\">&nbsp;</label>\n<div class=\"input-group date\"><input id=\"rep-param-id-" + param.id + "-2\" datepicker ng-model=\"param.value2\" class=\"form-control\">\n<div class=\"input-group-addon\"><span class=\"glyphicon glyphicon-th\"></span></div>\n</div>\n</div>";
        }
        return "<div class=\"row\"><div class=\"col-xs-6\"><label class=\"control-label\">&nbsp;</label><div class=\"input-group date\"><input id=\"rep-param-id-" + param.id + "\" datepicker ng-model=\"param.value1\" class=\"form-control\"><div class=\"input-group-addon\"><span class=\"glyphicon glyphicon-th\"></span></div></div></div>" + secondField + "</div>";
      },
      DateField: function(param) {
        var secondField;
        secondField = '';
        if (param.operation === 'between') {
          secondField = "<div class=\"col-xs-6\"><label class=\"control-label\">&nbsp;</label><div class=\"input-group date\"><input id=\"rep-param-id-" + param.id + "-2\" datepicker ng-model=\"param.value2\" class=\"form-control\"><div class=\"input-group-addon\"><span class=\"glyphicon glyphicon-th\"></span></div></div></div>";
        }
        return "<div class=\"row\"><div class=\"col-xs-6\"><label class=\"control-label\">&nbsp;</label><div class=\"input-group date\"><input id=\"rep-param-id-" + param.id + "\" datepicker ng-model=\"param.value1\" class=\"form-control\"><div class=\"input-group-addon\"><span class=\"glyphicon glyphicon-th\"></span></div></div></div>" + secondField + "</div>";
      },
      ForeignKey: function(param) {
        var multiple, serviceName;
        serviceName = param.params.info.model;
        multiple = '';
        if (param.operation === 'in') {
          multiple = 'multiple';
        }
        return "<div><label class=\"control-label\">&nbsp;</label><input id=\"rep-param-id-" + param.id + "\" ajax-choices=\"/api/rpc/" + serviceName + "/get_field_choices/\" field=\"" + param.name + "\" ng-model=\"param.value1\" " + multiple + "></div>";
      },
      sqlchoices: function(param) {
        return "<div><label class=\"control-label\">&nbsp;</label><input id=\"rep-param-id-" + param.id + "\" ajax-choices=\"/api/reports/choices/\" sql-choices=\"" + param.name + "\" ng-model=\"param.value1\"></div>";
      }
    };

    return Params;

  })();

  dtypeDict = {
    'str': 'CharField',
    'char': 'CharField',
    'datetime': 'DateTimeField',
    'decimal': 'DecimalField',
    'int': 'IntegerField'
  };

  Param = (function() {
    function Param(info, params1) {
      var dt;
      this.info = info;
      this.params = params1;
      this.name = this.info.name;
      this.label = this.info.label;
      this["static"] = this.info.param === 'static';
      this.field = this.params.info.fields && this.params.info.fields[this.name];
      this.type = this.info.type || (this.field && this.field.type) || 'CharField';
      console.log('param info', this.params.info);
      dt = dtypeDict[this.type.toLowerCase()];
      if (dt) {
        this.type = dt;
      }
      if (this.info.sql_choices) {
        this.type = 'sqlchoices';
      }
      this.defaultOperation = this.info.default_operation || Params.DefaultOperations[this.type];
      this.operation = this.defaultOperation;
      this.operations = this.getOperations();
      this.exclude = this.info.exclude;
      this.id = ++_counter;
    }

    Param.prototype.defaultValue = function() {
      return null;
    };

    Param.prototype.setOperation = function(op, focus) {
      var el;
      if (focus == null) {
        focus = true;
      }
      this.createControls(this.scope);
      el = this.el.find('#rep-param-id-' + this.id);
      if (focus) {
        el.focus();
      }
    };

    Param.prototype.createControls = function(scope) {
      var el, widget;
      el = this.el.find("#param-widget");
      el.empty();
      widget = Params.Widgets[this.type](this);
      widget = this.params.scope.compile(widget)(scope);
      return el.append(widget);
    };

    Param.prototype.getOperations = function() {
      var i, len, op, ref, results;
      ref = Params.TypeOperations[this.type];
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        op = ref[i];
        results.push({
          id: op,
          text: Params.Labels[op]
        });
      }
      return results;
    };

    Param.prototype.operationTemplate = function() {
      var opts;
      opts = this.getOperations();
      return "<div class=\"col-sm-4\"><label class=\"control-label\">" + this.label + "</label><select id=\"param-op-" + this.id + "\" ng-model=\"param.operation\" ng-init=\"param.operation='" + this.defaultOperation + "'\" class=\"form-control\" onchange=\"$('#param-" + this.id + "').data('param').change();$('#rep-param-id-" + this.id + "')[0].focus()\">\n" + opts + "\n</select></div>";
    };

    Param.prototype.template = function() {
      var operation;
      operation = this.operationTemplate();
      return "<div id=\"param-" + this.id + "\" class=\"row form-group\" data-param=\"" + this.name + "\" ng-controller=\"ParamController\"><div class=\"col-sm-12\">" + operation + "<div id=\"param-widget-" + this.id + "\"></div></div></div>";
    };

    Param.prototype.render = function(container) {
      this.el = this.params.scope.compile(this.template())(this.params.scope);
      this.el.data('param', this);
      this.createControls(this.el.scope());
      return container.append(this.el);
    };

    return Param;

  })();

  Katrid.uiKatrid.controller('ReportController', function($scope, $element, $compile) {
    var report, xmlReport;
    xmlReport = $scope.$parent.action.info.content;
    report = new Report($scope.$parent.action, $scope);
    $scope.report = report;
    report.loadFromXml(xmlReport);
    report.render($element);
    return report.loadParams();
  });

  Katrid.uiKatrid.controller('ReportParamController', function($scope, $element) {
    $scope.$parent.param.el = $element;
    $scope.$parent.param.scope = $scope;
    return $scope.$parent.param.setOperation($scope.$parent.param.operation, false);
  });

  this.Katrid.Reports = {
    Reports: Reports,
    Report: Report,
    Param: Param
  };

}).call(this);

//# sourceMappingURL=reports.js.map
