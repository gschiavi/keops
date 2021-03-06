
(function() {
  var formCount, uiKatrid,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  uiKatrid = Katrid.uiKatrid;

  formCount = 0;

  uiKatrid.directive('field', function($compile) {
    var fieldType, widget;
    fieldType = null;
    widget = null;
    return {
      restrict: 'E',
      replace: true,
      link: function(scope, element, attrs, ctrl, transclude) {
        var att, cols, fcontrol, field, fieldAttrs, form, templ, templAttrs, templTag, tp, v;
        field = scope.view.fields[attrs.name];
        if (element.parent('list').length === 0) {
          element.removeAttr('name');
          widget = attrs.widget;
          if (widget) {
            console.log(widget);
          }
          if (!widget) {
            tp = field.type;
            if (tp === 'ForeignKey') {
              widget = tp;
            } else if (field.choices) {
              widget = 'SelectField';
            } else if (tp === 'TextField') {
              widget = 'TextareaField';
            } else if (tp === 'BooleanField') {
              widget = 'CheckBox';
              cols = 3;
            } else if (tp === 'DecimalField') {
              widget = 'DecimalField';
              cols = 3;
            } else if (tp === 'DateField') {
              widget = 'DateField';
              cols = 3;
            } else if (tp === 'DateTimeField') {
              widget = 'DateField';
              cols = 3;
            } else if (tp === 'IntegerField') {
              widget = 'TextField';
              cols = 3;
            } else if (tp === 'SmallIntegerField') {
              widget = 'TextField';
              cols = 3;
            } else if (tp === 'CharField') {
              widget = 'TextField';
              if (field.max_length && field.max_length < 30) {
                cols = 3;
              }
            } else if (tp === 'OneToManyField') {
              widget = tp;
              cols = 12;
            } else if (tp === 'ManyToManyField') {
              widget = tp;
            } else if (tp === 'FileField') {
              widget = tp;
            } else if (tp === 'ImageField') {
              widget = tp;
            } else {
              widget = 'TextField';
            }
          }
          widget = new Katrid.UI.Widgets[widget]();
          field = scope.view.fields[attrs.name];
          templAttrs = [];
          if (attrs.ngShow) {
            templAttrs.push(' ng-show="' + attrs.ngShow + '"');
          }
          templAttrs = templAttrs.join(' ');
          templTag = 'section';
          templ = ("<" + templTag + " class=\"section-field-" + attrs.name + " form-group\" " + templAttrs + ">") + widget.template(scope, element, attrs, field) + ("</" + templTag + ">");
          templ = $compile(templ)(scope);
          element.replaceWith(templ);
          templ.addClass("col-md-" + (attrs.cols || cols || 6));
          fcontrol = templ.find('.form-field');
          if (fcontrol.length) {
            fcontrol = fcontrol[fcontrol.length - 1];
            form = templ.controller('form');
            ctrl = angular.element(fcontrol).data().$ngModelController;
            if (ctrl) {
              form.$addControl(ctrl);
            }
          }
          widget.link(scope, templ, fieldAttrs, $compile, field);
          fieldAttrs = {};
          for (att in attrs) {
            v = attrs[att];
            if (!(att.startsWith('field'))) {
              continue;
            }
            fieldAttrs[att] = v;
            element.removeAttr(att);
            attrs.$set(att);
          }
          return fieldAttrs.name = attrs.name;
        }
      }
    };
  });

  uiKatrid.directive('view', function() {
    return {
      restrict: 'E',
      template: function(element, attrs) {
        formCount++;
        return '';
      },
      link: function(scope, element, attrs) {
        if (scope.model) {
          element.attr('class', 'view-form-' + scope.model.name.replace(new RegExp('\.', 'g'), '-'));
          element.attr('id', 'katrid-form-' + formCount.toString());
          element.attr('model', scope.model);
          return element.attr('name', 'dataForm' + formCount.toString());
        }
      }
    };
  });

  uiKatrid.directive('list', function($compile, $http) {
    return {
      restrict: 'E',
      priority: 700,
      link: function(scope, element, attrs) {
        var html;
        console.log('im list', 1);
        html = Katrid.UI.Utils.Templates.renderList(scope, element, attrs);
        return element.replaceWith($compile(html)(scope));
      }
    };
  });

  uiKatrid.directive('ngSum', function() {
    return {
      restrict: 'A',
      priority: 9999,
      require: 'ngModel',
      link: function(scope, element, attrs, controller) {
        var field, nm, subField;
        nm = attrs.ngSum.split('.');
        field = nm[0];
        subField = nm[1];
        return scope.$watch('record.$' + field, function(newValue, oldValue) {
          var v;
          if (newValue && scope.record) {
            v = 0;
            scope.record[field].map((function(_this) {
              return function(obj) {
                return v += parseFloat(obj[subField]);
              };
            })(this));
            if (v.toString() !== controller.$modelValue) {
              controller.$setViewValue(v);
              controller.$render();
            }
          }
        });
      }
    };
  });

  uiKatrid.directive('grid', function($compile) {
    return {
      restrict: 'E',
      replace: true,
      scope: {},
      link: function(scope, element, attrs) {
        var field, masterChanged, p, renderDialog;
        field = scope.$parent.view.fields[attrs.name];
        scope.action = scope.$parent.action;
        scope.fieldName = attrs.name;
        scope.field = field;
        scope.records = [];
        scope.recordIndex = -1;
        scope._cachedViews = {};
        scope._changeCount = 0;
        scope.dataSet = [];
        scope.parent = scope.$parent;
        scope.model = new Katrid.Services.Model(field.model);
        scope.dataSource = new Katrid.Data.DataSource(scope);
        p = scope.$parent;
        while (p) {
          if (p.dataSource) {
            scope.dataSource.setMasterSource(p.dataSource);
            break;
          }
          p = p.$parent;
        }
        scope.dataSource.fieldName = scope.fieldName;
        scope.gridDialog = null;
        scope.model.loadViews().done(function(res) {
          return scope.$apply(function() {
            var html;
            scope._cachedViews = res.result;
            console.log(res.result);
            scope.view = scope._cachedViews.list;
            html = Katrid.UI.Utils.Templates.renderGrid(scope, $(scope.view.content), attrs, 'openItem($index)');
            return element.replaceWith($compile(html)(scope));
          });
        });
        renderDialog = function() {
          var el, html;
          html = scope._cachedViews.form.content;
          html = $(Katrid.UI.Utils.Templates.gridDialog().replace('<!-- view content -->', html));
          el = $compile(html)(scope);
          scope.formElement = el.find('form').first();
          scope.form = scope.formElement.controller('form');
          scope.gridDialog = el;
          el.modal('show');
          el.on('hidden.bs.modal', function() {
            scope.dataSource.setState(Katrid.Data.DataSourceState.browsing);
            el.remove();
            scope.gridDialog = null;
            return scope.recordIndex = -1;
          });
          return false;
        };
        scope.doViewAction = function(viewAction, target, confirmation) {
          return scope.action._doViewAction(scope, viewAction, target, confirmation);
        };
        scope._incChanges = function() {
          scope.parent.record['$' + scope.fieldName] = ++scope._changeCount;
          return scope.parent.record[scope.fieldName] = scope.records;
        };
        scope.addItem = function() {
          scope.dataSource.newRecord();
          return scope.showDialog();
        };
        scope.openItem = function(index) {
          scope.showDialog(index);
          if (scope.parent.dataSource.changing) {
            return scope.dataSource.editRecord();
          }
        };
        scope.removeItem = function(idx) {
          var rec;
          rec = scope.records[idx];
          scope.records.splice(idx, 1);
          scope._incChanges();
          rec.$deleted = true;
          return scope.dataSource.applyModifiedData(null, null, rec);
        };
        scope.$set = (function(_this) {
          return function(field, value) {
            var control;
            control = scope.form[field];
            control.$setViewValue(value);
            control.$render();
          };
        })(this);
        scope.save = function() {
          var attr, data, rec, v;
          data = scope.dataSource.applyModifiedData(scope.form, scope.gridDialog, scope.record);
          if (scope.recordIndex > -1) {
            rec = scope.records[scope.recordIndex];
            for (attr in data) {
              v = data[attr];
              rec[attr] = v;
            }
          } else if (scope.recordIndex === -1) {
            scope.records.push(scope.record);
          }
          scope.gridDialog.modal('toggle');
          scope._incChanges();
        };
        
        scope.showDialog = function(index) {
          var rec;
          if (index != null) {
            scope.recordIndex = index;
            if (!scope.dataSet[index]) {
              scope.dataSource.get(scope.records[index].id, 0).done(function(res) {
                if (res.ok) {
                  return scope.$apply(function() {
                    scope.dataSet[index] = scope.record;
                    if (scope.parent.dataSource.changing) {
                      return scope.dataSource.editRecord();
                    }
                  });
                }
              });
            }
            rec = scope.dataSet[index];
            scope.record = rec;
          } else {
            scope.recordIndex = -1;
          }
          if (scope._cachedViews.form) {
            setTimeout(function() {
              return renderDialog();
            });
          } else {
            scope.model.getViewInfo({
              view_type: 'form'
            }).done(function(res) {
              if (res.ok) {
                scope._cachedViews.form = res.result;
                return renderDialog();
              }
            });
          }
        };
        masterChanged = function(key) {
          console.log('master changed', key);
          var data;
          data = {};
          data[field.field] = key;
          scope._changeCount = 0;
          scope.records = [];
          return scope.dataSource.search(data);
        };
        return scope.$parent.$watch('recordId', function(key) {
          return masterChanged(key);
        });
      }
    };
  });

  uiKatrid.directive('ngEnter', function() {
    return function(scope, element, attrs) {
      return element.bind("keydown keypress", function(event) {
        if (event.which === 13) {
          scope.$apply(function() {
            return scope.$eval(attrs.ngEnter);
          });
          return event.preventDefault();
        }
      });
    };
  });

  uiKatrid.directive('datepicker', ['$filter', $filter =>
    ({
      restrict: 'A',
      priority: 1,
      require: '?ngModel',
      link(scope, element, attrs, controller) {
        let el = element;
        const dateFmt = Katrid.i18n.gettext('yyyy-mm-dd');
        const shortDate = dateFmt.replace(/[m]/g, 'M');
        var calendar = element.parent('div').datepicker({
          format: dateFmt,
          keyboardNavigation: false,
          language: Katrid.i18n.languageCode,
          forceParse: false,
          autoClose: true,
          showOnFocus: false}).on('changeDate', function(e) {
          const dp = calendar.data('datepicker');
          if (dp.picker && dp.picker.is(':visible')) {
            el.val($filter('date')(dp._utc_to_local(dp.viewDate), shortDate));
            return dp.hide();
          }
        });

        // Mask date format
        if (Katrid.Settings.UI.dateInputMask === true) {
          el = el.mask(dateFmt.replace(/[A-z]/g, 0));
        } else if (Katrid.Settings.UI.dateInputMask) {
          el = el.mask(Katrid.Settings.UI.dateInputMask);
        }

        controller.$formatters.push(function(value) {
          if (value) {
            const dt = new Date(value);
            calendar.datepicker('setDate', dt);
            return $filter('date')(value, shortDate);
          }
        });

        controller.$parsers.push(function(value) {
          if (_.isDate(value)) {
            return moment.utc(value).format('YYYY-MM-DD');
          }
          if (_.isString(value)) {
            return moment.utc(value, shortDate.toUpperCase()).format('YYYY-MM-DD');
          }
        });

        controller.$render = function() {
          if (_.isDate(controller.$viewValue)) {
            const v = $filter('date')(controller.$viewValue, shortDate);
            return el.val(v);
          } else {
            return el.val(controller.$viewValue);
          }
        };

        return el.on('blur', function(evt) {
          let sep, val;
          const dp = calendar.data('datepicker');
          if (dp.picker.is(':visible')) {
            dp.hide();
          }
          if (Array.from(Katrid.i18n.formats.SHORT_DATE_FORMAT).includes('/')) {
            sep = '/';
          } else {
            sep = '-';
          }
          const fmt = Katrid.i18n.formats.SHORT_DATE_FORMAT.toLowerCase().split(sep);
          const dt = new Date();
          let s = el.val();
          if ((fmt[0] === 'd') && (fmt[1] === 'm')) {
            if ((s.length === 5) || (s.length === 6)) {
              if (s.length === 6) {
                s = s.substr(0, 5);
              }
              val = s + sep + dt.getFullYear().toString();
            }
            if ((s.length === 2) || (s.length === 3)) {
              if (s.length === 3) {
                s = s.substr(0, 2);
              }
              val = new Date(dt.getFullYear(), dt.getMonth(), s);
            }
          } else if ((fmt[0] === 'm') && (fmt[1] === 'd')) {
            if ((s.length === 5) || (s.length === 6)) {
              if (s.length === 6) {
                s = s.substr(0, 5);
              }
              val = s + sep + dt.getFullYear().toString();
            }
            if ((s.length === 2) || (s.length === 3)) {
              if (s.length === 3) {
                s = s.substr(0, 2);
              }
              val = new Date(dt.getFullYear(), s, dt.getDay());
            }
          }
          if (val) {
            calendar.datepicker('setDate', val);
            el.val($filter('date')(dp._utc_to_local(dp.viewDate), shortDate));
            return controller.$setViewValue($filter('date')(dp._utc_to_local(dp.viewDate), shortDate));
          }
        });
      }
    })

  ]);


  uiKatrid.directive('ajaxChoices', function($location) {
    return {
      restrict: 'A',
      require: '?ngModel',
      link: function(scope, element, attrs, controller) {
        var cfg, el, multiple, serviceName;
        multiple = attrs.multiple;
        serviceName = attrs.ajaxChoices;
        cfg = {
          ajax: {
            url: serviceName,
            dataType: 'json',
            quietMillis: 500,
            data: function(term, page) {
              return {
                q: term,
                count: 1,
                page: page - 1,
                field: attrs.field
              };
            },
            results: function(data, page) {
              var item, more, res;
              res = data.result;
              data = res.items;
              more = (page * Katrid.Settings.Services.choicesPageLimit) < res.count;
              return {
                results: (function() {
                  var j, len, results;
                  results = [];
                  for (j = 0, len = data.length; j < len; j++) {
                    item = data[j];
                    results.push({
                      id: item[0],
                      text: item[1]
                    });
                  }
                  return results;
                })(),
                more: more
              };
            }
          },
          escapeMarkup: function(m) {
            return m;
          },
          initSelection: function(element, callback) {
            var i, j, len, v, values;
            v = controller.$modelValue;
            if (v) {
              if (multiple) {
                values = [];
                for (j = 0, len = v.length; j < len; j++) {
                  i = v[j];
                  values.push({
                    id: i[0],
                    text: i[1]
                  });
                }
                return callback(values);
              } else {
                return callback({
                  id: v[0],
                  text: v[1]
                });
              }
            }
          }
        };
        if (multiple) {
          cfg['multiple'] = true;
        }
        el = element.select2(cfg);
        element.on('$destroy', function() {
          $('.select2-hidden-accessible').remove();
          $('.select2-drop').remove();
          return $('.select2-drop-mask').remove();
        });
        el.on('change', function(e) {
          var v;
          v = el.select2('data');
          controller.$setDirty();
          if (v) {
            controller.$viewValue = v;
          }
          return scope.$apply();
        });
        return controller.$render = function() {
          if (controller.$viewValue) {
            return element.select2('val', controller.$viewValue);
          }
        };
      }
    };
  });

  uiKatrid.directive('decimal', function($filter) {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, element, attrs, controller) {
        var decimal, el, negative, precision, symbol, thousands;
        precision = parseInt(attrs.precision) || 2;
        thousands = attrs.uiMoneyThousands || ".";
        decimal = attrs.uiMoneyDecimal || ",";
        symbol = attrs.uiMoneySymbol;
        negative = attrs.uiMoneyNegative || true;
        el = element.maskMoney({
          symbol: symbol,
          thousands: thousands,
          decimal: decimal,
          precision: precision,
          allowNegative: negative,
          allowZero: true
        }).bind('keyup blur', function(event) {
          var newVal;
          newVal = element.maskMoney('unmasked')[0];
          if (newVal.toString() !== controller.$viewValue) {
            controller.$setViewValue(newVal);
            return scope.$apply();
          }
        });
        return controller.$render = function() {
          if (controller.$viewValue) {
            return element.val($filter('number')(controller.$viewValue, precision));
          } else {
            return element.val('');
          }
        };
      }
    };
  });

  Katrid.uiKatrid.directive('foreignkey', function() {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, el, attrs, controller) {
        var config, multiple, newItem, sel, serviceName;
        sel = el;
        el.addClass('form-field');
        if (attrs.serviceName) {
          serviceName = attrs.serviceName;
        } else {
          serviceName = scope.model.name;
        }
        newItem = function() {};
        config = {
          allowClear: true,
          ajax: {
            url: '/api/rpc/' + serviceName + '/get_field_choices/?args=' + attrs.name,
            data: function(term, page) {
              return {
                count: 1,
                page: page,
                q: term
              };
            },
            results: function(data, page) {
              var item, more, msg, r, res;
              res = data.result;
              data = res.items;
              r = (function() {
                var j, len, results;
                results = [];
                for (j = 0, len = data.length; j < len; j++) {
                  item = data[j];
                  results.push({
                    id: item[0],
                    text: item[1]
                  });
                }
                console.log(results);
                return results;
              })();
              more = (page * Katrid.Settings.Services.choicesPageLimit) < res.count;
              if (!multiple && !more) {
                msg = Katrid.i18n.gettext('Create <i>"{0}"</i>...');
                if (sel.data('select2').search.val()) {
                  r.push({
                    id: newItem,
                    text: msg
                  });
                }
              }
              return {
                results: r,
                more: more
              };
            }
          },
          formatResult: function(state) {
            var s;
            s = sel.data('select2').search.val();
            if (state.id === newItem) {
              state.str = s;
              return '<strong>' + state.text.format(s) + '</strong>';
            }
            return state.text;
          },
          initSelection: function(el, cb) {
            var obj, v;
            v = controller.$modelValue;
            if (multiple) {
              v = (function() {
                var j, len, results;
                results = [];
                for (j = 0, len = v.length; j < len; j++) {
                  obj = v[j];
                  results.push({
                    id: obj[0],
                    text: obj[1]
                  });
                }
                return results;
              })();
              return cb(v);
            } else if (v) {
              return cb({
                id: v[0],
                text: v[1]
              });
            }
          }
        };
        multiple = attrs.multiple;
        var _changing = false;
        if (multiple) {
          config['multiple'] = true;
        }
        sel = sel.select2(config);
        sel.on('change', function(e) {
          var obj, service, v;
          v = sel.select2('data');
          if (v && v.id === newItem) {
            service = new Katrid.Services.Model(scope.view.fields[attrs.name].model);
            return service.createName(v.str).then(function(res) {
              controller.$setDirty();
              controller.$setViewValue(res.result);
              sel.select2('val', {
                id: res.result[0],
                text: res.result[1]
              });
            });
          } else if (v && multiple) {
            try {
              _changing = true;
              controller.$setDirty();
              controller.$setViewValue(sel.select2('val'));
            } finally {
              _changing = false;
            }
          } else {
            controller.$setDirty();
            if (v) {
              return controller.$setViewValue([v.id, v.text]);
            } else {
              return controller.$setViewValue(null);
            }
          }
        });
        scope.$watch(attrs.ngModel, function(newValue, oldValue) {
          if (!_changing) sel.select2('val', newValue);
        });
        return controller.$render = function() {
          var obj, v;
          if (multiple) {
            if (controller.$viewValue) {
              v = (function() {
                var j, len, ref, results;
                ref = controller.$viewValue;
                results = [];
                for (j = 0, len = ref.length; j < len; j++) {
                  obj = ref[j];
                  results.push(obj[0]);
                }
                return results;
              })();
              sel.select2('val', v);
            }
          }
          if (controller.$viewValue) {
            return sel.select2('val', controller.$viewValue[0]);
          } else {
            return sel.select2('val', null);
          }
        };
      }
    };
  });

  uiKatrid.directive('searchView', function($compile) {
    return {
      restrict: 'E',
      replace: true,
      link: function(scope, el, attrs, controller) {
        var widget;
        scope.search = {};
        widget = new Katrid.UI.Views.SearchView(scope, {});
        widget.link(scope, el, attrs, controller, $compile);
      }
    };
  });

  uiKatrid.directive('searchBox', function() {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, el, attrs, controller) {
        var cfg, fields, view;
        view = scope.views.search;
        fields = view.fields;
        cfg = {
          multiple: true,
          minimumInputLength: 1,
          formatSelection: (function(_this) {
            return function(obj, element) {
              if (obj.field) {
                element.append("<span class=\"search-icon\">" + obj.field.caption + "</span>: <i class=\"search-term\">" + obj.text + "</i>");
              } else if (obj.id.caption) {
                element.append("<span class=\"search-icon\">" + obj.id.caption + "</span>: <i class=\"search-term\">" + obj.text + "</i>");
              } else {
                element.append('<span class="fa fa-filter search-icon"></span><span class="search-term">' + obj.text + '</span>');
              }
            };
          })(this),
          id: function(obj) {
            if (obj.field) {
              return obj.field.name;
              return '<' + obj.field.name + ' ' + obj.id + '>';
            }
            return obj.id.name;
            return obj.id.name + '-' + obj.text;
          },
          formatResult: (function(_this) {
            return function(obj, element, query) {
              if (obj.id.type === 'ForeignKey') {
                return "> Pesquisar <i>" + obj.id.caption + "</i> por: <strong>" + obj.text + "</strong>";
              } else if (obj.field && obj.field.type === 'ForeignKey') {
                return obj.field.caption + ": <i>" + obj.text + "</i>";
              } else {
                return "Pesquisar <i>" + obj.id.caption + "</i> por: <strong>" + obj.text + "</strong>";
              }
            };
          })(this),
          query: (function(_this) {
            return function(options) {
              var f;
              if (options.field) {
                scope.model.getFieldChoices(options.field.name, options.term).done(function(res) {
                  var obj;
                  return options.callback({
                    results: (function() {
                      var j, len, ref, results;
                      ref = res.result;
                      results = [];
                      for (j = 0, len = ref.length; j < len; j++) {
                        obj = ref[j];
                        results.push({
                          id: obj[0],
                          text: obj[1],
                          field: options.field
                        });
                      }
                      return results;
                    })()
                  });
                });
                return;
              }
              options.callback({
                results: (function() {
                  var results;
                  results = [];
                  for (f in fields) {
                    results.push({
                      id: fields[f],
                      text: options.term
                    });
                  }
                  return results;
                })()
              });
            };
          })(this)
        };
        el.select2(cfg);
        el.data('select2').blur();
        el.on('change', (function(_this) {
          return function() {
            return controller.$setViewValue(el.select2('data'));
          };
        })(this));
        el.on('select2-selecting', (function(_this) {
          return function(e) {
            var v;
            if (e.choice.id.type === 'ForeignKey') {
              v = el.data('select2');
              v.opts.query({
                element: v.opts.element,
                term: v.search.val(),
                field: e.choice.id,
                callback: function(data) {
                  v.opts.populateResults.call(v, v.results, data.results, {
                    term: '',
                    page: null,
                    context: v.context
                  });
                  return v.postprocessResults(data, false, false);
                }
              });
              return e.preventDefault();
            }
          };
        })(this));
      }
    };
  });

  uiKatrid.controller('TabsetController', [
    '$scope', function($scope) {
      var ctrl, destroyed, tabs;
      ctrl = this;
      tabs = ctrl.tabs = $scope.tabs = [];
      ctrl.select = function(selectedTab) {
        angular.forEach(tabs, function(tab) {
          if (tab.active && tab !== selectedTab) {
            tab.active = false;
            tab.onDeselect();
          }
        });
        selectedTab.active = true;
        selectedTab.onSelect();
      };
      ctrl.addTab = function(tab) {
        tabs.push(tab);
        if (tabs.length === 1) {
          tab.active = true;
        } else if (tab.active) {
          ctrl.select(tab);
        }
      };
      ctrl.removeTab = function(tab) {
        var index, newActiveIndex;
        index = tabs.indexOf(tab);
        if (tab.active && tabs.length > 1 && !destroyed) {
          newActiveIndex = index === tabs.length - 1 ? index - 1 : index + 1;
          ctrl.select(tabs[newActiveIndex]);
        }
        tabs.splice(index, 1);
      };
      destroyed = void 0;
      $scope.$on('$destroy', function() {
        destroyed = true;
      });
    }
  ]);

  uiKatrid.directive('tabset', function() {
    return {
      restrict: 'EA',
      transclude: true,
      replace: true,
      scope: {
        type: '@'
      },
      controller: 'TabsetController',
      template: "<div><div class=\"clearfix\"></div>\n" + "  <ul class=\"nav nav-{{type || 'tabs'}}\" ng-class=\"{'nav-stacked': vertical, 'nav-justified': justified}\" ng-transclude></ul>\n" + "  <div class=\"tab-content\">\n" + "    <div class=\"tab-pane\" \n" + "         ng-repeat=\"tab in tabs\" \n" + "         ng-class=\"{active: tab.active}\"\n" + "         tab-content-transclude=\"tab\">\n" + "    </div>\n" + "  </div>\n" + "</div>\n",
      link: function(scope, element, attrs) {
        scope.vertical = angular.isDefined(attrs.vertical) ? scope.$parent.$eval(attrs.vertical) : false;
        return scope.justified = angular.isDefined(attrs.justified) ? scope.$parent.$eval(attrs.justified) : false;
      }
    };
  });

  uiKatrid.directive('tab', [
    '$parse', function($parse) {
      return {
        require: '^tabset',
        restrict: 'EA',
        replace: true,
        template: "<li ng-class=\"{active: active, disabled: disabled}\">\n" + "  <a href ng-click=\"select()\" tab-heading-transclude>{{heading}}</a>\n" + "</li>\n",
        transclude: true,
        scope: {
          active: '=?',
          heading: '@',
          onSelect: '&select',
          onDeselect: '&deselect'
        },
        controller: function() {},
        compile: function(elm, attrs, transclude) {
          return function(scope, elm, attrs, tabsetCtrl) {
            scope.$watch('active', function(active) {
              if (active) {
                tabsetCtrl.select(scope);
              }
            });
            scope.disabled = false;
            if (attrs.disabled) {
              scope.$parent.$watch($parse(attrs.disabled), function(value) {
                scope.disabled = !!value;
              });
            }
            scope.select = function() {
              if (!scope.disabled) {
                scope.active = true;
              }
            };
            tabsetCtrl.addTab(scope);
            scope.$on('$destroy', function() {
              tabsetCtrl.removeTab(scope);
            });
            scope.$transcludeFn = transclude;
          };
        }
      };
    }
  ]);

  uiKatrid.directive('tabHeadingTransclude', [
    function() {
      return {
        restrict: 'A',
        require: '^tab',
        link: function(scope, elm, attrs, tabCtrl) {
          scope.$watch('headingElement', function(heading) {
            if (heading) {
              elm.html('');
              elm.append(heading);
            }
          });
        }
      };
    }
  ]);

  uiKatrid.directive('tabContentTransclude', function() {
    var isTabHeading;
    isTabHeading = function(node) {
      return node.tagName && (node.hasAttribute('tab-heading') || node.hasAttribute('data-tab-heading') || node.tagName.toLowerCase() === 'tab-heading' || node.tagName.toLowerCase() === 'data-tab-heading');
    };
    return {
      restrict: 'A',
      require: '^tabset',
      link: function(scope, elm, attrs) {
        var tab;
        tab = scope.$eval(attrs.tabContentTransclude);
        tab.$transcludeFn(tab.$parent, function(contents) {
          angular.forEach(contents, function(node) {
            if (isTabHeading(node)) {
              tab.headingElement = node;
            } else {
              elm.append(node);
            }
          });
        });
      }
    };
  });

  uiKatrid.filter('m2m', function() {
    return function(input) {
      var obj;
      if (_.isArray(input)) {
        return ((function() {
          var j, len, results;
          results = [];
          for (j = 0, len = input.length; j < len; j++) {
            obj = input[j];
            results.push(obj[1]);
          }
          return results;
        })()).join(', ');
      }
    };
  });

  uiKatrid.filter('moment', function() {
    return function(input, format) {
      if (format) {
        return moment().format(format);
      }
      return moment(input).fromNow();
    };
  });

  uiKatrid.directive('fileReader', function() {
    return {
      restrict: 'A',
      require: 'ngModel',
      scope: {},
      link: function(scope, element, attrs, controller) {
        if (attrs.accept === 'image/*') {
          element.tag === 'INPUT';
        }
        return element.bind('change', function() {
          var reader;
          reader = new FileReader();
          reader.onload = function(event) {
            return controller.$setViewValue(event.target.result);
          };
          return reader.readAsDataURL(event.target.files[0]);
        });
      }
    };
  });

}).call(this);
