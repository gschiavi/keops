// Generated by CoffeeScript 1.10.0
(function() {
  var DataSource, DataSourceState, Record, RecordState,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  RecordState = (function() {
    function RecordState() {}

    RecordState.destroyed = 'destroyed';

    RecordState.created = 'created';

    RecordState.modified = 'modified';

    return RecordState;

  })();

  DataSourceState = (function() {
    function DataSourceState() {}

    DataSourceState.inserting = 'inserting';

    DataSourceState.browsing = 'browsing';

    DataSourceState.editing = 'editing';

    DataSourceState.loading = 'loading';

    DataSourceState.inactive = 'inactive';

    return DataSourceState;

  })();

  DataSource = (function() {
    function DataSource(scope) {
      this.scope = scope;
      this.onFieldChange = bind(this.onFieldChange, this);
      this.recordIndex = 0;
      this.recordCount = null;
      this.loading = false;
      this.loadingRecord = false;
      this.masterSource = null;
      this.pageIndex = 0;
      this.pageLimit = 100;
      this.offset = 0;
      this.offsetLimit = 0;
      this.requestInterval = 300;
      this.pendingRequest = null;
      this.fieldName = null;
      this.children = [];
      this.modifiedData = null;
      this.uploading = 0;
      this.state = null;
      this.fieldChangeWatchers = [];
    }

    DataSource.prototype.cancelChanges = function() {
      if (this.state === DataSourceState.inserting && Katrid.Settings.UI.goToDefaultViewAfterCancelInsert) {
        this.scope.record = null;
        this.scope.action.setViewType('list');
      } else {
        if (this.state === DataSourceState.editing) {
          this.refresh([this.scope.record.id]).then((function(_this) {
            return function() {
              return _this.setState(DataSourceState.browsing);
            };
          })(this));
        } else {
          this.scope.record = null;
          this.setState(DataSourceState.browsing);
        }
      }
    };

    DataSource.prototype.saveChanges = function() {
      var beforeSubmit, data, el;
      el = this.scope.formElement;
      if (this.validate()) {
        data = this.getModifiedData(this.scope.form, el, this.scope.record);
        console.log('saving data', data);
        this.scope.form.data = data;
        beforeSubmit = el.attr('before-submit');
        console.log('before submit', beforeSubmit);
        if (beforeSubmit) {
          beforeSubmit = this.scope.$eval(beforeSubmit);
        }
        console.log(this.scope.form.data);
        if (data) {
          this.uploading++;
          this.scope.model.write([data]).done((function(_this) {
            return function(res) {
              var child, elfield, field, fld, i, j, len, len1, msg, msgs, ref, s;
              if (res.ok) {
                _this.scope.form.$setPristine();
                _this.scope.form.$setUntouched();
                ref = _this.children;
                for (i = 0, len = ref.length; i < len; i++) {
                  child = ref[i];
                  delete child.modifiedData;
                }
                _this.setState(DataSourceState.browsing);
                return _this.refresh(res.result);
              } else {
                s = "<span>" + (Katrid.i18n.gettext('The following fields are invalid:')) + "<hr></span>";
                if (res.message) {
                  s = res.message;
                } else if (res.messages) {
                  for (fld in res.messages) {
                    msgs = res.messages[fld];
                    field = _this.scope.view.fields[fld];
                    elfield = el.find(".form-field[name=\"" + field.name + "\"]");
                    elfield.addClass('ng-invalid ng-touched');
                    s += "<strong>" + field.caption + "</strong><ul>";
                    for (j = 0, len1 = msgs.length; j < len1; j++) {
                      msg = msgs[j];
                      s += "<li>" + msg + "</li>";
                    }
                    s += '</ul>';
                  }
                  if (elfield) {
                    elfield.focus();
                  }
                }
                return Katrid.Dialogs.Alerts.error(s);
              }
            };
          })(this)).always((function(_this) {
            return function() {
              return _this.scope.$apply(function() {
                return _this.uploading--;
              });
            };
          })(this));
        } else {
          Katrid.Dialogs.Alerts.warn(Katrid.i18n.gettext('No pending changes'));
        }
      }
    };

    DataSource.prototype.copy = function(id) {
      return this.scope.model.copy(id).done((function(_this) {
        return function(res) {
          console.log(res);
          _this.setState(DataSourceState.inserting);
          _this.scope.record = {};
          return _this.scope.$apply(function() {
            return _this.setFields(res.result);
          });
        };
      })(this));
    };

    DataSource.prototype.findById = function(id) {
      var i, len, rec, ref;
      ref = this.scope.records;
      for (i = 0, len = ref.length; i < len; i++) {
        rec = ref[i];
        if (rec.id === id) {
          return rec;
        }
      }
    };

    DataSource.prototype.hasKey = function(id) {
      var i, len, rec, ref, results;
      ref = this.scope.records;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        rec = ref[i];
        if (rec.id === id) {
          results.push(true);
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    DataSource.prototype.refresh = function(data) {
      if (data) {
        return this.get(data[0]);
      } else {
        return this.search(this._params, this._page);
      }
    };

    DataSource.prototype.validate = function() {
      var child, el, elfield, errorType, field, i, len, ref, s;
      if (this.scope.form.$invalid) {
        s = "<span>" + (Katrid.i18n.gettext('The following fields are invalid:')) + "</span><hr>";
        el = this.scope.formElement;
        for (errorType in this.scope.form.$error) {
          ref = this.scope.form.$error[errorType];
          for (i = 0, len = ref.length; i < len; i++) {
            child = ref[i];
            elfield = el.find(".form-field[name=\"" + child.$name + "\"]");
            elfield.addClass('ng-touched');
            field = this.scope.view.fields[child.$name];
            s += "<span>" + field.caption + "</span><ul><li>" + (Katrid.i18n.gettext('This field cannot be empty.')) + "</li></ul>";
          }
        }
        console.log(elfield);
        elfield.focus();
        Katrid.Dialogs.Alerts.error(s);
        return false;
      }
      return true;
    };

    DataSource.prototype.getIndex = function(obj) {
      var rec;
      rec = this.findById(obj.id);
      return this.scope.records.indexOf(rec);
    };

    DataSource.prototype.search = function(params, page, fields) {
      var def;
      this._params = params;
      this._page = page;
      this._clearTimeout();
      this.pendingRequest = true;
      this.loading = true;
      page = page || 1;
      this.pageIndex = page;
      params = {
        count: true,
        page: page,
        params: params,
        fields: fields
      };
      def = new $.Deferred();
      this.pendingRequest = setTimeout((function(_this) {
        return function() {
          return _this.scope.model.search(params, {
            count: true
          }).fail(function(res) {
            return def.reject(res);
          }).done(function(res) {
            if (_this.pageIndex > 1) {
              _this.offset = (_this.pageIndex - 1) * _this.pageLimit + 1;
            } else {
              _this.offset = 1;
            }
            _this.scope.$apply(function() {
              if (res.result.count != null) {
                _this.recordCount = res.result.count;
              }
              _this.scope.records = res.result.data;
              if (_this.pageIndex === 1) {
                return _this.offsetLimit = _this.scope.records.length;
              } else {
                return _this.offsetLimit = _this.offset + _this.scope.records.length - 1;
              }
            });
            return def.resolve(res);
          }).always(function() {
            _this.pendingRequest = false;
            return _this.scope.$apply(function() {
              return _this.loading = false;
            });
          });
        };
      })(this), this.requestInterval);
      return def.promise();
    };

    DataSource.prototype.groupBy = function(group) {
      if (!group) {
        this.groups = [];
        return;
      }
      this.groups = [group];
      return this.scope.model.groupBy(group.context).then((function(_this) {
        return function(res) {
          var grouping, i, len, r, ref, row, s;
          _this.scope.records = [];
          grouping = group.context.grouping[0];
          ref = res.result;
          for (i = 0, len = ref.length; i < len; i++) {
            r = ref[i];
            s = r[grouping];
            if ($.isArray(s)) {
              r._paramValue = s[0];
              s = s[1];
            } else {
              r._paramValue = s;
            }
            r.__str__ = s;
            r.expanded = false;
            r.collapsed = true;
            r._searchGroup = group;
            r._paramName = grouping;
            row = {
              _group: r,
              _hasGroup: true
            };
            _this.scope.records.push(row);
          }
          return _this.scope.$apply();
        };
      })(this));
    };

    DataSource.prototype.goto = function(index) {
      return this.scope.moveBy(index - this.recordIndex);
    };

    DataSource.prototype.moveBy = function(index) {
      var newIndex;
      newIndex = this.recordIndex + index - 1;
      if (newIndex > -1 && newIndex < this.scope.records.length) {
        this.recordIndex = newIndex + 1;
        return this.scope.location.search('id', this.scope.records[newIndex].id);
      }
    };

    DataSource.prototype._clearTimeout = function() {
      if (this.pendingRequest) {
        this.loading = false;
        this.loadingRecord = false;
        return clearTimeout(this.pendingRequest);
      }
    };

    DataSource.prototype.setMasterSource = function(master) {
      this.masterSource = master;
      return master.children.push(this);
    };

    DataSource.prototype.applyModifiedData = function(form, element, record) {
      var _id, attr, data, ds, obj, v;
      data = this.getModifiedData(form, element, record);
      _id = _.hash(record);
      if (data) {
        ds = this.modifiedData;
        if (ds == null) {
          ds = {};
        }
        obj = ds[_id];
        if (!obj) {
          obj = {};
          ds[_id] = obj;
        }
        for (attr in data) {
          v = data[attr];
          obj[attr] = v;
          record[attr] = v;
        }
        this.modifiedData = ds;
        this.masterSource.scope.form.$setDirty();
      }
      console.log(this.modifiedData);
      return data;
    };

    DataSource.prototype.getModifiedData = function(form, element, record) {
      var attr, child, data, el, i, j, len, len1, nm, obj, ref, ref1, ref2, subData;
      if (record.$deleted) {
        if (record.id) {
          return {
            id: record.id,
            $deleted: true
          };
        }
        return;
      }
      if (form.$dirty) {
        data = {};
        ref = $(element).find('.form-field.ng-dirty');
        for (i = 0, len = ref.length; i < len; i++) {
          el = ref[i];
          nm = el.name;
          data[nm] = record[nm];
        }
        ref1 = this.children;
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          child = ref1[j];
          subData = data[child.fieldName] || [];
          ref2 = child.modifiedData;
          for (attr in ref2) {
            obj = ref2[attr];
            if (obj.$deleted) {
              obj = {
                action: 'DESTROY',
                id: obj.id
              };
            } else if (obj.id) {
              obj = {
                action: 'UPDATE',
                values: obj
              };
            } else {
              obj = {
                action: 'CREATE',
                values: obj
              };
            }
            subData.push(obj);
          }
          if (subData) {
            data[child.fieldName] = subData;
          }
        }
        if (data) {
          if (record.id) {
            data.id = record.id;
          }
          return data;
        }
      }
    };

    DataSource.prototype.get = function(id, timeout) {
      var _get, def;
      this._clearTimeout();
      this.setState(DataSourceState.loading);
      this.loadingRecord = true;
      def = new $.Deferred();
      _get = (function(_this) {
        return function() {
          return _this.scope.model.getById(id).fail(function(res) {
            return def.reject(res);
          }).done(function(res) {
            console.log(res);
            _this.scope.$apply(function() {
              return _this._setRecord(res.result.data[0]);
            });
            return def.resolve(res);
          }).always(function() {
            _this.setState(DataSourceState.browsing);
            return _this.scope.$apply(function() {
              return _this.loadingRecord = false;
            });
          });
        };
      })(this);
      if (timeout === 0) {
        return _get();
      }
      if (this.requestInterval || timeout) {
        this.pendingRequest = setTimeout(_get, timeout || this.requestInterval);
      }
      return def.promise();
    };

    DataSource.prototype.newRecord = function() {
      this.setState(DataSourceState.inserting);
      _this.scope.record = {};
      return this.scope.model.getDefaults().done((function(_this) {
        return function(res) {
          if (res.result) {
            return _this.scope.$apply(function() {
              _this.scope.record = {};
              _this.scope.record.display_name = Katrid.i18n.gettext('(New)');
              return _this.setFields(res.result);
            });
          }
        };
      })(this));
    };

    DataSource.prototype.setFields = function(values) {
      var attr, control, results, v;
      results = [];
      for (attr in values) {
      let field = this.scope.view.fields[attr];
        v = values[attr];

        if (field && ((field.type === 'DateField') || (field.type === 'DateTimeField'))) {
          let d = new Date(v);
          let tz = d.getTimezoneOffset() * 60000;
          v = new Date(d.getTime() + tz);
        }

        control = this.scope.form[attr];
        if (control) {
          control.$setViewValue(v);
          control.$render();
          if (v === false) {
            this.scope.record[attr] = v;
            results.push(control.$setDirty());
          } else {
            results.push(void 0);
          }
        } else {
          results.push(this.scope.record[attr] = v);
        }
      }
      return results;
    };

    DataSource.prototype.editRecord = function() {
      return this.setState(DataSourceState.editing);
    };

    DataSource.prototype.setState = function(state) {
      var ref;
      this.state = state;
      return this.changing = (ref = this.state) === DataSourceState.editing || ref === DataSourceState.inserting;
    };

    DataSource.prototype._setRecord = function(rec) {
      this.scope.record = rec;
      this.scope.recordId = rec.id;
      return this.state = DataSourceState.browsing;
    };

    DataSource.prototype.next = function() {
      return this.moveBy(1);
    };

    DataSource.prototype.prior = function() {
      return this.moveBy(-1);
    };

    DataSource.prototype.nextPage = function() {
      var p;
      p = this.recordCount / this.pageLimit;
      if (Math.floor(p)) {
        p++;
      }
      if (p > this.pageIndex + 1) {
        return this.scope.location.search('page', this.pageIndex + 1);
      }
    };

    DataSource.prototype.prevPage = function() {
      if (this.pageIndex > 1) {
        return this.scope.location.search('page', this.pageIndex - 1);
      }
    };

    DataSource.prototype.setRecordIndex = function(index) {
      return this.recordIndex = index + 1;
    };

    DataSource.prototype.onFieldChange = function(res) {
      if (res.ok && res.result && res.result.fields) {
        return this.scope.$apply((function(_this) {
          return function() {
            var f, ref, results, v;
            ref = res.result.fields;
            results = [];
            for (f in ref) {
              v = ref[f];
              results.push(_this.scope.$set(f, v));
            }
            return results;
          };
        })(this));
      }
    };

    DataSource.prototype.expandGroup = function(index, row) {
      var params, rg;
      rg = row._group;
      params = {
        params: {}
      };
      params.params[rg._paramName] = rg._paramValue;
      return this.scope.model.search(params).then((function(_this) {
        return function(res) {
          if (res.ok && res.result.data) {
            return _this.scope.$apply(function() {
              rg._children = res.result.data;
              return _this.scope.records.splice.apply(_this.scope.records, [index + 1, 0].concat(res.result.data));
            });
          }
        };
      })(this));
    };

    DataSource.prototype.collapseGroup = function(index, row) {
      var group;
      group = row._group;
      this.scope.records.splice(index + 1, group._children.length);
      return delete group._children;
    };

    return DataSource;

  })();

  Record = (function() {
    function Record(res1) {
      this.res = res1;
      this.data = this.res.data;
    }

    return Record;

  })();

  Katrid.Data = {
    DataSource: DataSource,
    Record: Record,
    RecordState: RecordState,
    DataSourceState: DataSourceState
  };

}).call(this);
