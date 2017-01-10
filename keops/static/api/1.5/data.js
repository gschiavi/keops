// Generated by CoffeeScript 1.10.0
(function() {
  var DataSource, DataSourceState, Record, RecordState;

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
      return this.setState(DataSourceState.browsing);
    };

    DataSource.prototype.saveChanges = function() {
      var data, el;
      el = this.scope.formElement;
      if (this.validate()) {
        data = this.getModifiedData(this.scope.form, el, this.scope.record);
        if (data) {
          this.uploading++;
          this.scope.model.write([data]).done((function(_this) {
            return function(res) {
              var elfield, field, fld, i, len, msg, msgs, s;
              if (res.ok) {
                _this.scope.form.$setPristine();
                _this.scope.record = null;
                _this.scope.action.setViewType('list');
                return _this.search();
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
                    console.log(field);
                    for (i = 0, len = msgs.length; i < len; i++) {
                      msg = msgs[i];
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

    DataSource.prototype.search = function(params, page) {
      var def;
      this._clearTimeout();
      this.pendingRequest = true;
      this.loading = true;
      page = page || 1;
      this.pageIndex = page;
      params = {
        count: true,
        page: page,
        params: params
      };
      def = new $.Deferred();
      this.pendingRequest = setTimeout((function(_this) {
        return function() {
          return _this.scope.model.search(params, {
            count: true
          }).fail(function(res) {
            return def.reject(res);
          }).done(function(res) {
            console.log(res);
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
      var attr, data, ds, obj;
      data = this.getModifiedData(form, element, record);
      if (data) {
        ds = this.modifiedData;
        if (ds == null) {
          ds = {};
        }
        obj = ds[record];
        if (!obj) {
          obj = {};
          ds[record] = obj;
        }
        for (attr in data) {
          obj[attr] = data[attr];
          record[attr] = data[attr];
        }
        this.modifiedData = ds;
        this.masterSource.scope.form.$setDirty();
      }
      return data;
    };

    DataSource.prototype.getModifiedData = function(form, element, record) {
      var attr, child, data, el, i, j, len, len1, nm, obj, ref, ref1, subData;
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
          for (attr in child.modifiedData) {
            obj = child.modifiedData[attr];
            if (obj.__state === RecordState.destroyed) {
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
      this.loadingRecord = true;
      def = new $.Deferred();
      _get = (function(_this) {
        return function() {
          return _this.scope.model.getById(id).fail(function(res) {
            return def.reject(res);
          }).done(function(res) {
            _this.scope.$apply(function() {
              return _this._setRecord(res.result.data[0]);
            });
            return def.resolve(res);
          }).always(function() {
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
      this.scope.record = {};
      this.scope.record.__str__ = Katrid.i18n.gettext('(New)');
      return this.scope.model.getDefaults().done((function(_this) {
        return function(res) {
          if (res.result) {
            return _this.scope.$apply(function() {
              var attr, control, ref, results, v;
              ref = res.result;
              results = [];
              for (attr in ref) {
                v = ref[attr];
                control = _this.scope.form[attr];
                control.$setViewValue(v);
                control.$render();
                if (v === false) {
                  _this.scope.record[attr] = v;
                  results.push(control.$setDirty());
                } else {
                  results.push(void 0);
                }
              }
              return results;
            });
          }
        };
      })(this));
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

//# sourceMappingURL=data.js.map
