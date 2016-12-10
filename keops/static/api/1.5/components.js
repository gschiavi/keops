// Generated by CoffeeScript 1.10.0
(function() {
  var formCount, uiKatrid;

  uiKatrid = Katrid.uiKatrid;

  formCount = 0;

  uiKatrid.directive('field', function($compile) {
    var fieldType, widget;
    fieldType = null;
    widget = null;
    return {
      restrict: 'E',
      replace: true,
      template: function(element, attrs) {
        if ((element.parent('list').length)) {
          fieldType = 'column';
          return '<column></column>';
        } else {
          fieldType = 'field';
          return '<section class="section-field-' + attrs.name + ' col-lg-6 form-group" />';
        }
      },
      link: function(scope, element, attrs) {
        var field, templ, tp;
        field = scope.view.fields[attrs.name];
        if (fieldType === 'field') {
          widget = attrs.widget;
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
            } else {
              widget = 'TextField';
            }
          }
          widget = new Katrid.UI.Widgets[widget];
          field = scope.view.fields[attrs.name];
          templ = $compile(widget.template(scope, element, attrs, field))(scope);
          element.append(templ);
          return widget.link(scope, element, attrs, $compile, field);
        } else {
          return element.append('<button>teste</button>');
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

  uiKatrid.directive('list', function($compile) {
    return {
      restrict: 'E',
      link: function(scope, element, attrs) {
        var html;
        html = Katrid.UI.Utils.Templates.renderList(scope, element, attrs);
        return element.replaceWith($compile(html)(scope));
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

  uiKatrid.directive('datepicker', function() {
    return {
      restrict: 'A',
      require: '?ngModel',
      link: function(scope, element, attrs, controller) {
        var el, updateModelValue;
        el = element.datepicker({
          format: Katrid.i18n.gettext('dd/mm/yyyy'),
          forceParse: false
        });
        updateModelValue = function() {
          return el.val(controller.$modelValue);
        };
        scope.$watch(attrs.ngModel, updateModelValue);
        el = el.mask('00/00/0000');
        controller.$render = function() {
          return console.log(controller.$modelValue);
        };
        return el.on('blur', function(evt) {
          var dt, s;
          s = el.val();
          if ((s.length === 5) || (s.length === 6)) {
            if (s.length === 6) {
              s = s.substr(0, 5);
            }
            dt = new Date();
            el.datepicker('setDate', s + '/' + dt.getFullYear().toString());
          }
          if ((s.length === 2) || (s.length === 3)) {
            if (s.length === 3) {
              s = s.substr(0, 2);
            }
            dt = new Date();
            return el.datepicker('setDate', new Date(dt.getFullYear(), dt.getMonth(), s));
          }
        });
      }
    };
  });

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
                t: 1,
                p: page - 1,
                file: attrs.reportFile,
                sql_choices: attrs.sqlChoices
              };
            },
            results: function(data, page) {
              var more;
              console.log(data);
              data = data.items;
              more = (page * 10) < data.count;
              if (!multiple && (page === 1)) {
                data.splice(0, 0, {
                  id: null,
                  text: '---------'
                });
              }
              return {
                results: data,
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

}).call(this);

//# sourceMappingURL=components.js.map
