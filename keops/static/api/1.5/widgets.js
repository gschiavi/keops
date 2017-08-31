// Generated by CoffeeScript 1.10.0
(function() {
  var CheckBox, DateField, DecimalField, FileField, ForeignKey, ImageField, InputWidget, ManyToManyField, OneToManyField, PasswordField, SelectField, TextField, TextareaField, Widget, widgetCount,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  widgetCount = 0;

  Widget = (function() {
    Widget.prototype.tag = 'div';

    function Widget() {
      this.classes = ['form-field'];
    }

    Widget.prototype.ngModel = function(attrs) {
      return 'record.' + attrs.name;
    };

    Widget.prototype.getId = function(id) {
      return 'katrid-input-' + id.toString();
    };

    Widget.prototype.widgetAttrs = function(scope, el, attrs, field) {
      var attr, attrName, r, v;
      r = {};
      if (field.required) {
        r['required'] = null;
      }
      r['ng-model'] = this.ngModel(attrs);
      r['ng-show'] = 'dataSource.changing';
      for (attr in attrs) {
        v = attrs[attr];
        if (!(attr.startsWith('field'))) {
          continue;
        }
        attrName = attrs.$attr[attr];
        if (attrName.startsWith('field-')) {
          attrName = attrName.substr(6, attrName.length - 6);
        }
        r[attrName] = v;
      }
      if (attrs.readonly != null) {
        r['readonly'] = '';
      }
      if (this.classes) {
        r['class'] = this.classes.join(' ');
      }
      return r;
    };

    Widget.prototype._getWidgetAttrs = function(scope, el, attrs, field) {
      var att, attributes, html, v;
      html = '';
      attributes = this.widgetAttrs(scope, el, attrs, field);
      for (att in attributes) {
        v = attributes[att];
        html += ' ' + att;
        if (v) {
          html += '="' + v + '"';
        }
      }
      if (this.placeholder) {
        html += " placeholder=\"" + this.placeholder + "\" ";
      }
      return html;
    };

    Widget.prototype.innerHtml = function(scope, el, attrs, field) {
      return '';
    };

    Widget.prototype.labelTemplate = function(scope, el, attrs, field) {
      var label, placeholder;
      placeholder = '';
      label = field.caption;
      if (attrs.nolabel === 'placeholder') {
        this.placeholder = field.caption;
        return '';
      } else if (attrs.nolabel) {
        return '';
      }
      return "<label for=\"" + attrs._id + "\" class=\"form-label\">" + label + "</label>";
    };

    Widget.prototype.spanTemplate = function(scope, el, attrs, field) {
      return "<span class=\"form-field-readonly\" ng-show=\"!dataSource.changing\">${ record." + attrs.name + " || '--' }</span>";
    };

    Widget.prototype.widgetTemplate = function(scope, el, attrs, field, type) {
      var html, inner;
      if (this.tag.startsWith('input')) {
        html = "<" + this.tag + " id=\"" + attrs._id + "\" type=\"" + type + "\" name=\"" + attrs.name + "\" " + (this._getWidgetAttrs(scope, el, attrs, field)) + ">";
      } else {
        html = "<" + this.tag + " id=\"" + attrs._id + "\" name=\"" + attrs.name + "\" " + (this._getWidgetAttrs(scope, el, attrs, field)) + ">";
      }
      inner = this.innerHtml(scope, el, attrs, field);
      if (inner) {
        html += inner + ("</" + this.tag + ">");
      }
      return html;
    };

    Widget.prototype.template = function(scope, el, attrs, field, type) {
      var html, id;
      if (type == null) {
        type = 'text';
      }
      widgetCount++;
      id = this.getId(widgetCount);
      attrs._id = id;
      html = '<div>' + this.labelTemplate(scope, el, attrs, field) + this.spanTemplate(scope, el, attrs, field) + this.widgetTemplate(scope, el, attrs, field, type) + '</div>';
      return html;
    };

    Widget.prototype.link = function(scope, el, attrs, $compile, field) {
      var dep, i, len, ref, results;
      if (field.depends) {
        ref = field.depends;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          dep = ref[i];
          if (!(indexOf.call(scope.dataSource.fieldChangeWatchers, dep) < 0)) {
            continue;
          }
          scope.dataSource.fieldChangeWatchers.push(dep);
          results.push(scope.$watch('record.' + dep, function(newValue, oldValue) {
            if (newValue !== oldValue && scope.dataSource.changing) {
              return scope.model.onFieldChange(dep, scope.record).done(scope.dataSource.onFieldChange);
            }
          }));
        }
        return results;
      }
    };

    return Widget;

  })();

  InputWidget = (function(superClass) {
    extend(InputWidget, superClass);

    InputWidget.prototype.tag = 'input';

    function InputWidget() {
      InputWidget.__super__.constructor.apply(this, arguments);
      this.classes.push('form-control');
    }

    InputWidget.prototype.widgetTemplate = function(scope, el, attrs, field, type) {
      var html, prependIcon;
      if (type == null) {
        type = 'text';
      }
      prependIcon = attrs.icon;
      html = InputWidget.__super__.widgetTemplate.call(this, scope, el, attrs, field, type);
      if (prependIcon) {
        return "<label class=\"prepend-icon\" ng-show=\"dataSource.changing\"><i class=\"icon " + prependIcon + "\"></i>" + html + "</label>";
      }
      return html;
    };

    return InputWidget;

  })(Widget);

  TextField = (function(superClass) {
    extend(TextField, superClass);

    function TextField() {
      return TextField.__super__.constructor.apply(this, arguments);
    }

    TextField.prototype.widgetAttrs = function(scope, el, attrs, field) {
      var attributes;
      attributes = TextField.__super__.widgetAttrs.call(this, scope, el, attrs, field);
      if (field.max_length) {
        attributes['maxlength'] = field.max_length.toString();
      }
      return attributes;
    };

    return TextField;

  })(InputWidget);

  SelectField = (function(superClass) {
    extend(SelectField, superClass);

    function SelectField() {
      return SelectField.__super__.constructor.apply(this, arguments);
    }

    SelectField.prototype.tag = 'select';

    SelectField.prototype.spanTemplate = function(scope, el, attrs, field) {
      return "<span class=\"form-field-readonly\" ng-show=\"!dataSource.changing\">${ view.fields." + attrs.name + ".displayChoices[record." + attrs.name + "] || '--' }</span>";
    };

    SelectField.prototype.innerHtml = function(scope, el, attrs, field) {
      return "<option ng-repeat=\"choice in view.fields." + attrs.name + ".choices\" value=\"${choice[0]}\">${choice[1]}</option>";
    };

    return SelectField;

  })(InputWidget);

  ForeignKey = (function(superClass) {
    extend(ForeignKey, superClass);

    function ForeignKey() {
      return ForeignKey.__super__.constructor.apply(this, arguments);
    }

    ForeignKey.prototype.tag = 'input foreignkey';

    ForeignKey.prototype.spanTemplate = function(scope, el, attrs, field) {
      return "<a href=\"javascript:void(0)\" class=\"form-field-readonly\" ng-show=\"!dataSource.changing\">${ record." + attrs.name + "[1] || '--' }</a>";
    };

    ForeignKey.prototype.template = function(scope, el, attrs, field) {
      return ForeignKey.__super__.template.call(this, scope, el, attrs, field, 'hidden');
    };

    return ForeignKey;

  })(Widget);

  TextareaField = (function(superClass) {
    extend(TextareaField, superClass);

    function TextareaField() {
      return TextareaField.__super__.constructor.apply(this, arguments);
    }

    TextareaField.prototype.tag = 'textarea';

    return TextareaField;

  })(TextField);

  DecimalField = (function(superClass) {
    extend(DecimalField, superClass);

    function DecimalField() {
      return DecimalField.__super__.constructor.apply(this, arguments);
    }

    DecimalField.prototype.tag = 'input decimal';

    DecimalField.prototype.spanTemplate = function(scope, el, attrs, field) {
      var decimalPlaces;
      decimalPlaces = attrs.decimalPlaces || field.decimal_places || 2;
      return "<span class=\"form-field-readonly\" ng-show=\"!dataSource.changing\">${ (record." + attrs.name + "|number:" + decimalPlaces + ") || '--' }</span>";
    };

    return DecimalField;

  })(TextField);

  DateField = (function(superClass) {
    extend(DateField, superClass);

    function DateField() {
      return DateField.__super__.constructor.apply(this, arguments);
    }

    DateField.prototype.tag = 'input datepicker';

    DateField.prototype.spanTemplate = function(scope, el, attrs, field) {
      return "<span class=\"form-field-readonly\" ng-show=\"!dataSource.changing\">${ (record." + attrs.name + "|date:'" + (Katrid.i18n.gettext('yyyy-mm-dd').replace(/[m]/g, 'M')) + "') || '--' }</span>";
    };

    DateField.prototype.widgetTemplate = function(scope, el, attrs, field, type) {
      var html;
      html = DateField.__super__.widgetTemplate.call(this, scope, el, attrs, field, type);
      return "<div class=\"input-group date\" ng-show=\"dataSource.changing\">" + html + "<div class=\"input-group-addon\"><span class=\"glyphicon glyphicon-th\"></span></div></div>";
    };

    return DateField;

  })(TextField);

  OneToManyField = (function(superClass) {
    extend(OneToManyField, superClass);

    function OneToManyField() {
      return OneToManyField.__super__.constructor.apply(this, arguments);
    }

    OneToManyField.prototype.tag = 'grid';

    OneToManyField.prototype.spanTemplate = function(scope, el, attrs, field) {
      return '';
    };

    OneToManyField.prototype.template = function(scope, el, attrs, field) {
      var html;
      html = OneToManyField.__super__.template.call(this, scope, el, attrs, field, 'grid');
      return html;
    };

    return OneToManyField;

  })(Widget);

  ManyToManyField = (function(superClass) {
    extend(ManyToManyField, superClass);

    function ManyToManyField() {
      return ManyToManyField.__super__.constructor.apply(this, arguments);
    }

    ManyToManyField.prototype.tag = 'input foreignkey multiple';

    ManyToManyField.prototype.spanTemplate = function(scope, el, attrs, field) {
      return "<span class=\"form-field-readonly\" ng-show=\"!dataSource.changing\">${ record." + attrs.name + "|m2m }</span>";
    };

    ManyToManyField.prototype.template = function(scope, el, attrs, field) {
      return ManyToManyField.__super__.template.call(this, scope, el, attrs, field, 'hidden');
    };

    return ManyToManyField;

  })(Widget);

  CheckBox = (function(superClass) {
    extend(CheckBox, superClass);

    function CheckBox() {
      return CheckBox.__super__.constructor.apply(this, arguments);
    }

    CheckBox.prototype.spanTemplate = function(scope, el, attrs, field) {
      return "<span class=\"form-field-readonly bool-text\" ng-show=\"!dataSource.changing\">\n${ record." + attrs.name + " ? Katrid.i18n.gettext('yes') : Katrid.i18n.gettext('no') }\n</span>";
    };

    CheckBox.prototype.widgetTemplate = function(scope, el, attrs, field) {
      var html;
      html = CheckBox.__super__.widgetTemplate.call(this, scope, el, attrs, field, 'checkbox');
      html = '<label class="checkbox" ng-show="dataSource.changing">' + html;
      if (field.help_text) {
        html += field.help_text;
      } else {
        html += field.caption;
      }
      html += '<i></i></label>';
      return html;
    };

    CheckBox.prototype.labelTemplate = function(scope, el, attrs, field) {
      if (field.help_text) {
        return CheckBox.__super__.labelTemplate.call(this, scope, el, attrs, field);
      }
      return "<label for=\"" + attrs._id + "\" class=\"form-label\"><span ng-show=\"!dataSource.changing\">" + field.caption + "</span></label>";
    };

    return CheckBox;

  })(InputWidget);

  FileField = (function(superClass) {
    extend(FileField, superClass);

    function FileField() {
      return FileField.__super__.constructor.apply(this, arguments);
    }

    FileField.prototype.tag = 'input file-reader';

    FileField.prototype.template = function(scope, el, attrs, field, type) {
      if (type == null) {
        type = 'file';
      }
      return FileField.__super__.template.call(this, scope, el, attrs, field, type);
    };

    return FileField;

  })(InputWidget);

  ImageField = (function(superClass) {
    extend(ImageField, superClass);

    function ImageField() {
      return ImageField.__super__.constructor.apply(this, arguments);
    }

    ImageField.prototype.tag = 'input file-reader accept="image/*"';

    ImageField.prototype.template = function(scope, el, attrs, field, type) {
      if (type == null) {
        type = 'file';
      }
      return ImageField.__super__.template.call(this, scope, el, attrs, field, type);
    };

    ImageField.prototype.spanTemplate = function() {
      return '';
    };

    ImageField.prototype.widgetTemplate = function(scope, el, attrs, field, type) {
      var html;
      html = ImageField.__super__.widgetTemplate.call(this, scope, el, attrs, field, type);
      html = "<div class=\"image-box image-field\">\n<img ng-src=\"${record." + field.name + " || '/static/web/static/assets/img/avatar.png'}\" />\n  <div class=\"text-right image-box-buttons\">\n  <button class=\"btn btn-default\" type=\"button\" title=\"" + (Katrid.i18n.gettext('Change')) + "\" onclick=\"$(this).closest('.image-box').find('input').trigger('click')\"><i class=\"fa fa-pencil\"></i></button>\n  <button class=\"btn btn-default\" type=\"button\" title=\"" + (Katrid.i18n.gettext('Clear')) + "\" ng-click=\"$set('" + field.name + "', null)\"><i class=\"fa fa-trash\"></i></button>\n  </div>\n    " + html + "</div>";
      return html;
    };

    return ImageField;

  })(FileField);

  PasswordField = (function(superClass) {
    extend(PasswordField, superClass);

    function PasswordField() {
      return PasswordField.__super__.constructor.apply(this, arguments);
    }

    PasswordField.prototype.template = function(scope, el, attrs, field, type) {
      if (type == null) {
        type = 'password';
      }
      return PasswordField.__super__.template.call(this, scope, el, attrs, field, type);
    };

    PasswordField.prototype.spanTemplate = function(scope, el, attrs, field) {
      return "<span class=\"form-field-readonly\" ng-show=\"!dataSource.changing\">*******************</span>";
    };

    return PasswordField;

  })(InputWidget);

  this.Katrid.UI.Widgets = {
    Widget: Widget,
    InputWidget: InputWidget,
    TextField: TextField,
    SelectField: SelectField,
    ForeignKey: ForeignKey,
    TextareaField: TextareaField,
    DecimalField: DecimalField,
    DateField: DateField,
    CheckBox: CheckBox,
    OneToManyField: OneToManyField,
    ManyToManyField: ManyToManyField,
    FileField: FileField,
    PasswordField: PasswordField,
    ImageField: ImageField
  };

}).call(this);

//# sourceMappingURL=widgets.js.map
