// Generated by CoffeeScript 2.3.1
(function() {
  var Templates;

  Templates = class Templates {
    getViewRenderer(viewType) {
      return this["render_" + viewType];
    }

    getViewModesButtons(scope) {
      var act, buttons;
      act = scope.action;
      buttons = {
        card: '<button class="btn btn-default" type="button" ng-click="action.setViewType(\'card\')"><i class="fa fa-th-large"></i></button>',
        list: '<button class="btn btn-default" type="button" ng-click="action.setViewType(\'list\')"><i class="fa fa-list"></i></button>',
        form: '<button class="btn btn-default" type="button" ng-click="action.setViewType(\'form\')"><i class="fa fa-edit"></i></button>',
        calendar: '<button class="btn btn-default" type="button" ng-click="action.setViewType(\'calendar\')"><i class="fa fa-calendar"></i></button>',
        chart: '<button class="btn btn-default" type="button" ng-click="action.setViewType(\'chart\')"><i class="fa fa-bar-chart-o"></i></button>'
      };
      return buttons;
    }

    // buttons group include
    getViewButtons(scope) {
      var act, buttons, i, len, r, ref, vt;
      act = scope.action;
      buttons = this.getViewModesButtons(scope);
      r = [];
      ref = act.viewModes;
      for (i = 0, len = ref.length; i < len; i++) {
        vt = ref[i];
        r.push(buttons[vt]);
      }
      return '<div class="btn-group">' + r.join('') + '</div>';
    }

    gridDialog() {
      return `<div class="modal fade" tabindex="-1" role="dialog">\n  <div class="modal-dialog modal-lg" role="document">\n    <div class="modal-content">\n      <div class="modal-header">\n        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>\n        <h4 class="modal-title" id="myModalLabel">\${field.caption}</h4>\n      </div>\n      <div class="modal-body">\n<div class="row">\n<!-- view content -->\n</div>\n<div class="clearfix"></div>\n      </div>\n      <div class="modal-footer">\n        <button type="button" class="btn btn-primary" type="button" ng-click="save()" ng-show="dataSource.changing">${Katrid.i18n.gettext('Save')}</button>\n        <button type="button" class="btn btn-default" type="button" data-dismiss="modal" ng-show="dataSource.changing">${Katrid.i18n.gettext('Cancel')}</button>\n        <button type="button" class="btn btn-default" type="button" data-dismiss="modal" ng-show="!dataSource.changing">${Katrid.i18n.gettext('Close')}</button>\n      </div>\n    </div>\n  </div>\n</div>`;
    }

    preRender_card(scope, html) {
      var buttons, field, i, len, name, ref;
      buttons = this.getViewButtons(scope);
      html = $(html);
      html.children('field').remove();
      ref = html.find('field');
      for (i = 0, len = ref.length; i < len; i++) {
        field = ref[i];
        field = $(field);
        name = $(field).attr('name');
        field.replaceWith(`\${ record.${name} }`);
      }
      html = html.html();
      return `<div class="data-heading panel panel-default">\n    <div class="panel-body">\n      <div class='row'>\n        <div class="col-sm-6">\n        <h2>\n          \${ action.info.display_name }\n        </h2>\n        </div>\n        <search-view class="col-md-6"/>\n        <!--<p class="help-block">\${ action.info.usage }&nbsp;</p>-->\n      </div>\n      <div class="row">\n      <div class="toolbar">\n<div class="col-sm-6">\n        <button class="btn btn-primary" type="button" ng-click="action.createNew()">${Katrid.i18n.gettext('Create')}</button>\n        <span ng-show="dataSource.loading" class="badge page-badge-ref fadeIn animated">\${dataSource.pageIndex}</span>\n\n  <div class="btn-group">\n    <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true">\n      ${Katrid.i18n.gettext('Action')} <span class="caret"></span></button>\n    <ul class="dropdown-menu animated flipInX">\n      <li><a href='javascript:void(0)' ng-click="action.deleteSelection()"><i class="fa fa-fw fa-trash"></i> ${Katrid.i18n.gettext('Delete')}</a></li>\n    </ul>\n  </div>\n\n  <button class="btn btn-default" ng-click="dataSource.refresh()"><i class="fa fa-refresh"></i> Atualizar</button>\n\n</div>\n<div class="col-sm-6">\n  <div class="btn-group animated fadeIn search-view-more-area" ng-show="search.viewMoreButtons">\n    <button class="btn btn-default"><span class="fa fa-filter"></span> ${Katrid.i18n.gettext('Filters')} <span class="caret"></span></button>\n    <button class="btn btn-default"><span class="fa fa-bars"></span> ${Katrid.i18n.gettext('Group By')} <span class="caret"></span></button>\n    <ul class="dropdown-menu animated flipInX search-view-groups-menu">\n    </ul>\n    <button class="btn btn-default"><span class="fa fa-star"></span> ${Katrid.i18n.gettext('Favorites')} <span class="caret"></span></button>\n  </div>\n\n  <div class="pull-right">\n            <div class="btn-group pagination-area">\n              <span class="paginator">\${dataSource.offset|number} - \${dataSource.offsetLimit|number}</span> / <span class="total-pages">\${dataSource.recordCount|number}</span>\n            </div>\n    <div class="btn-group">\n      <button class="btn btn-default" type="button" ng-click="dataSource.prevPage()"><i class="fa fa-chevron-left"></i>\n      </button>\n      <button class="btn btn-default" type="button" ng-click="dataSource.nextPage()"><i class="fa fa-chevron-right"></i>\n      </button>\n    </div>\n\n    ${buttons}\n</div>\n</div>\n</div>\n</div>\n    </div>\n</div>\n<div class="content no-padding">\n<div class="panel panel-default data-panel">\n<div class="card-view animated fadeIn">\n  <div ng-repeat="record in records" class="panel panel-default card-item card-link" ng-click="action.listRowClick($index, record)">\n    ${html}\n  </div>\n\n  <div class="card-item card-ghost"></div>\n  <div class="card-item card-ghost"></div>\n  <div class="card-item card-ghost"></div>\n  <div class="card-item card-ghost"></div>\n  <div class="card-item card-ghost"></div>\n  <div class="card-item card-ghost"></div>\n  <div class="card-item card-ghost"></div>\n  <div class="card-item card-ghost"></div>\n  <div class="card-item card-ghost"></div>\n  <div class="card-item card-ghost"></div>\n  <div class="card-item card-ghost"></div>\n\n</div>\n</div>\n</div>`;
    }

    preRender_form(scope, html) {
      var act, actions, buttons, confirmation, i, len, ref;
      buttons = this.getViewButtons(scope);
      actions = '';
      if (scope.view.view_actions) {
        ref = scope.view.view_actions;
        for (i = 0, len = ref.length; i < len; i++) {
          act = ref[i];
          if (act.confirm) {
            confirmation = ", '" + act.confirm + "'";
          } else {
            confirmation = ', null';
          }
          if (act.prompt) {
            confirmation += ", '" + act.prompt + "'";
          }
          actions += `<li><a href="javascript:void(0)" ng-click="action.doViewAction('${act.name}', record.id${confirmation})">${act.title}</a></li>`;
        }
      }
      return `<div ng-form="form"><div class="data-heading panel panel-default">\n    <div class="panel-body">\n      <div>\n        <a href="javascript:void(0)" title="Add to favorite"><i class="fa star fa-star-o pull-right"></i></a>\n        <ol class="breadcrumb">\n          <li><h2><a href="javascript:void(0)" ng-click="action.setViewType(\'list\')">\${ action.info.display_name }</a></h2></li>\n          <li>\${ (dataSource.loadingRecord && Katrid.i18n.gettext('Loading...')) || record.display_name }</li>\n        </ol>\n        <p class="help-block">\${ action.info.usage }</p>\n      </div>\n      <div class="toolbar">\n  <button class="btn btn-primary" type="button" ng-disabled="dataSource.uploading" ng-click="dataSource.saveChanges()" ng-show="dataSource.changing">${Katrid.i18n.gettext('Save')}</button>\n  <button class="btn btn-primary" type="button" ng-disabled="dataSource.uploading" ng-click="dataSource.editRecord()" ng-show="!dataSource.changing">${Katrid.i18n.gettext('Edit')}</button>\n  <button class="btn btn-default" type="button" ng-disabled="dataSource.uploading" ng-click="dataSource.newRecord()" ng-show="!dataSource.changing">${Katrid.i18n.gettext('Create')}</button>\n  <button class="btn btn-default" type="button" ng-click="dataSource.cancelChanges()" ng-show="dataSource.changing">${Katrid.i18n.gettext('Cancel')}</button>\n  <div class="btn-group">\n    <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true">\n      ${Katrid.i18n.gettext('Action')} <span class="caret"></span></button>\n    <ul class="dropdown-menu animated flipInX">\n      <li><a href='javascript:void(0)' ng-click="action.deleteSelection()"><i class="fa fa-fw fa-trash"></i> ${Katrid.i18n.gettext('Delete')}</a></li>\n      <li><a href='javascript:void(0)' ng-click="action.copy()"><i class="fa fa-fw fa-files-o"></i> ${Katrid.i18n.gettext('Duplicate')}</a></li>\n      ${actions}\n    </ul>\n  </div>\n  <div class="pull-right">\n    <div class="btn-group pagination-area">\n        <span ng-show="records.length">\n          \${dataSource.recordIndex} / \${records.length}\n        </span>\n    </div>\n    <div class="btn-group" role="group">\n      <button class="btn btn-default" type="button" ng-click="dataSource.prior(\'form\')"><i class="fa fa-chevron-left"></i>\n      </button>\n      <button class="btn btn-default" type="button" ng-click="dataSource.next(\'form\')"><i class="fa fa-chevron-right"></i>\n      </button>\n    </div>\n\n    ${buttons}\n</div>\n</div>\n    </div>\n  </div><div class="content container animated fadeIn"><div class="panel panel-default data-panel browsing" ng-class="{ browsing: dataSource.browsing, editing: dataSource.changing }">\n<div class="panel-body"><div class="row">${html}</div></div></div></div></div>`;
      return html;
    }

    preRender_list(scope, html) {
      var buttons, reports;
      reports = `<div class="btn-group">\n  <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true">\n    ${Katrid.i18n.gettext('Print')} <span class="caret"></span></button>\n  <ul class="dropdown-menu animated flipInX">\n    <li><a href='javascript:void(0)' ng-click="action.autoReport()"><i class="fa fa-fw fa-file"></i> ${Katrid.i18n.gettext('Auto Report')}</a></li>\n  </ul>\n</div>`;
      buttons = this.getViewButtons(scope);
      return `<div class="data-heading panel panel-default">\n  <div class="panel-body">\n    <div class='row'>\n      <div class="col-sm-6">\n        <h2>\${ action.info.display_name }</h2>\n      </div>\n      <search-view class="col-md-6"/>\n      <!--<p class="help-block">\${ action.info.usage }&nbsp;</p>-->\n    </div>\n    <div class="row">\n    <div class="toolbar">\n<div class="col-sm-6">\n      <button class="btn btn-primary" type="button" ng-click="action.createNew()">${Katrid.i18n.gettext('Create')}</button>\n      <span ng-show="dataSource.loading" class="badge page-badge-ref fadeIn animated">\${dataSource.pageIndex}</span>\n\n${reports}\n<div class="btn-group">\n  <button type="button" class="btn btn-default dropdown-toggle btn-actions" data-toggle="dropdown" aria-haspopup="true">\n    ${Katrid.i18n.gettext('Action')} <span class="caret"></span></button>\n  <ul class="dropdown-menu animated flipInX ul-actions">\n    <li><a href='javascript:void(0)' ng-click="action.deleteSelection()"><i class="fa fa-fw fa-trash"></i> ${Katrid.i18n.gettext('Delete')}</a></li>\n  </ul>\n</div>\n\n<button class="btn btn-default" ng-click="dataSource.refresh()"><i class="fa fa-refresh"></i> Atualizar</button>\n\n</div>\n<div class="col-sm-6">\n<div class="btn-group animated fadeIn search-view-more-area" ng-show="search.viewMoreButtons">\n  <button class="btn btn-default"><span class="fa fa-filter"></span> ${Katrid.i18n.gettext('Filters')} <span class="caret"></span></button>\n  <button class="btn btn-default"><span class="fa fa-bars"></span> ${Katrid.i18n.gettext('Group By')} <span class="caret"></span></button>\n  <ul class="dropdown-menu animated flipInX search-view-groups-menu">\n  </ul>\n  <button class="btn btn-default"><span class="fa fa-star"></span> ${Katrid.i18n.gettext('Favorites')} <span class="caret"></span></button>\n</div>\n\n<div class="pull-right">\n          <div class="btn-group pagination-area">\n            <span class="paginator">\${dataSource.offset|number} - \${dataSource.offsetLimit|number}</span> / <span class="total-pages">\${dataSource.recordCount|number}</span>\n          </div>\n  <div class="btn-group">\n    <button class="btn btn-default" type="button" ng-click="dataSource.prevPage()"><i class="fa fa-chevron-left"></i>\n    </button>\n    <button class="btn btn-default" type="button" ng-click="dataSource.nextPage()"><i class="fa fa-chevron-right"></i>\n    </button>\n  </div>\n\n  ${buttons}\n</div>\n</div>\n</div>\n</div>\n  </div>\n</div><div class="content no-padding">\n<div class="panel panel-default data-panel">\n<div class="panel-body no-padding">\n<div class="dataTables_wrapper form-inline dt-bootstrap no-footer">${html}</div></div></div></div>`;
    }

    renderList(scope, element, attrs, rowClick, parentDataSource) {
      var choice, cls, col, colHtml, cols, decimalPlaces, fieldInfo, i, j, len, len1, name, ref, ref1, s, ths;
      ths = '<th ng-show="dataSource.groups.length"></th>';
      cols = "<td ng-show=\"dataSource.groups.length\" class=\"group-header\">\n<div ng-show=\"row._group\">\n<span class=\"fa fa-fw fa-caret-right\"\n  ng-class=\"{'fa-caret-down': row._group.expanded, 'fa-caret-right': row._group.collapsed}\"></span>\n  ${row._group.__str__} (${row._group.count})</div></td>";
      ref = element.children();
      for (i = 0, len = ref.length; i < len; i++) {
        col = ref[i];
        col = $(col);
        name = col.attr('name');
        if (!name) {
          cols += `<td>${col.html()}</td>`;
          ths += "<th><span>${col.attr('caption')}</span></th>";
          continue;
        }
        if (col.attr('visible') === 'False') {
          continue;
        }
        name = col.attr('name');
        fieldInfo = scope.view.fields[name];
        if (fieldInfo.choices) {
          fieldInfo._listChoices = {};
          ref1 = fieldInfo.choices;
          for (j = 0, len1 = ref1.length; j < len1; j++) {
            choice = ref1[j];
            fieldInfo._listChoices[choice[0]] = choice[1];
          }
        }
        cls = `${fieldInfo.type} list-column`;
        ths += `<th class="${cls}" name="${name}"><span>\${view.fields.${name}.caption}</span></th>`;
        cls = `${fieldInfo.type} field-${name}`;
        colHtml = col.html();
        if (colHtml) {
          cols += `<td><a data-id="\${row.${name}[0]}">${colHtml}</a></td>`;
        } else if (fieldInfo.type === 'ForeignKey') {
          cols += `<td><a data-id="\${row.${name}[0]}">\${row.${name}[1]}</a></td>`;
        } else if (fieldInfo._listChoices) {
          cols += `<td class="${cls}">\${view.fields.${name}._listChoices[row.${name}]}</td>`;
        } else if (fieldInfo.type === 'BooleanField') {
          cols += `<td class="bool-text ${cls}">\${row.${name} ? '${Katrid.i18n.gettext('yes')}' : '${Katrid.i18n.gettext('no')}'}</td>`;
        } else if (fieldInfo.type === 'DecimalField') {
          decimalPlaces = fieldInfo.decimal_places || 2;
          cols += `<td class="${cls}">\${row.${name}|number:${decimalPlaces}}</td>`;
        } else if (fieldInfo.type === 'DateField') {
          cols += `<td class="${cls}">\${row.${name}|date:'${Katrid.i18n.gettext('yyyy-mm-dd').replace(/[m]/g, 'M')}'}</td>`;
        } else {
          cols += `<td>\${row.${name}}</td>`;
        }
      }
      if (parentDataSource) {
        ths += "<th class=\"list-column-delete\" ng-show=\"parent.dataSource.changing\">";
        cols += "<td class=\"list-column-delete\" ng-show=\"parent.dataSource.changing\" ng-click=\"removeItem($index);$event.stopPropagation();\"><i class=\"fa fa-trash\"></i></td>";
      }
      if (rowClick == null) {
        rowClick = 'action.listRowClick($index, row)';
      }
      s = `<table ng-show="!dataSource.loading" class="table table-striped table-bordered table-condensed table-hover display responsive nowrap dataTable no-footer dtr-column">\n<thead><tr>${ths}</tr></thead>\n<tbody>\n<tr ng-repeat="row in records" ng-click="${rowClick}" ng-class="{'group-header': row._hasGroup}">${cols}</tr>\n</tbody>\n</table>\n<div ng-show="dataSource.loading" class="col-sm-12 margin-bottom-16 margin-top-16">${Katrid.i18n.gettext('Loading...')}</div>`;
      return s;
    }

    renderGrid(scope, element, attrs, rowClick) {
      var tbl;
      tbl = this.renderList(scope, element, attrs, rowClick, true);
      return `<div><div><button class="btn btn-xs btn-info" ng-click="addItem()" ng-show="parent.dataSource.changing" type="button">${Katrid.i18n.gettext('Add')}</button></div>${tbl}</div>`;
    }

    renderReportDialog(scope) {
      return `<div ng-controller="ReportController">\n<form id="report-form" method="get" action="/web/reports/report/">\n  <div class="data-heading panel panel-default">\n    <div class="panel-body">\n    <h2>\${ report.name }</h3>\n    <div class="toolbar">\n      <button class="btn btn-primary" type="button" ng-click="report.preview()"><span class="fa fa-print fa-fw"></span> ${Katrid.i18n.gettext('Preview')}</button>\n\n      <div class="btn-group">\n        <button class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true"\n                aria-expanded="false">${Katrid.i18n.gettext('Export')} <span class="caret"></span></button>\n        <ul class="dropdown-menu">\n          <li><a href="javascript:void(0)" ng-click="report.preview()">PDF</a></li>\n          <li><a href="javascript:void(0)" ng-click="report.export('docx')">Word</a></li>\n          <li><a href="javascript:void(0)" ng-click="report.export('xlsx')">Excel</a></li>\n          <li><a href="javascript:void(0)" ng-click="report.export('pptx')">PowerPoint</a></li>\n          <li><a href="javascript:void(0)" ng-click="report.export('csv')">CSV</a></li>\n          <li><a href="javascript:void(0)" ng-click="report.export('txt')">${Katrid.i18n.gettext('Text File')}</a></li>\n        </ul>\n      </div>\n\n      <div class="btn-group">\n        <button class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true"\n                aria-expanded="false">${Katrid.i18n.gettext('My reports')} <span class="caret"></span></button>\n        <ul class="dropdown-menu">\n          <li ng-repeat="rep in report.info.user_reports">\n            <a href="javascript:void(0)" ng-click="$parent.report.loadUserReport(rep.id)">\${ rep.name }</a>\n          </li>\n        </ul>\n      </div>\n\n    <div class="pull-right btn-group">\n      <button class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true"\n              aria-expanded="false"><i class="fa fa-gear fa-fw"></i></button>\n      <ul class="dropdown-menu">\n        <li><a href="javascript:void(0)" ng-click="report.saveDialog()">${Katrid.i18n.gettext('Save')}</a></li>\n      </ul>\n    </div>\n\n    </div>\n  </div>\n  </div>\n  <div class="col-sm-12">\n    <table class="col-sm-12" style="margin-top: 20px; display:none;">\n      <tr>\n        <td colspan="2" style="padding-top: 8px;">\n          <label>${Katrid.i18n.gettext('My reports')}</label>\n\n          <select class="form-control" ng-change="action.userReportChanged(action.userReport.id)" ng-model="action.userReport.id">\n              <option value=""></option>\n              <option ng-repeat="rep in userReports" value="\${ rep.id }">\${ rep.name }</option>\n          </select>\n        </td>\n      </tr>\n    </table>\n  </div>\n<div id="report-params">\n<div id="params-fields" class="col-sm-12 form-group">\n  <div class="checkbox"><label><input type="checkbox" ng-model="paramsAdvancedOptions"> ${Katrid.i18n.gettext('Advanced options')}</label></div>\n  <div ng-show="paramsAdvancedOptions">\n    <div class="form-group">\n      <label>${Katrid.i18n.gettext('Printable Fields')}</label>\n      <input type="hidden" id="report-id-fields"/>\n    </div>\n    <div class="form-group">\n      <label>${Katrid.i18n.gettext('Totalizing Fields')}</label>\n      <input type="hidden" id="report-id-totals"/>\n    </div>\n  </div>\n</div>\n\n<div id="params-sorting" class="col-sm-12 form-group">\n  <label class="control-label">${Katrid.i18n.gettext('Sorting')}</label>\n  <select multiple id="report-id-sorting"></select>\n</div>\n\n<div id="params-grouping" class="col-sm-12 form-group">\n  <label class="control-label">${Katrid.i18n.gettext('Grouping')}</label>\n  <select multiple id="report-id-grouping"></select>\n</div>\n\n<div class="clearfix"></div>\n\n</div>\n  <hr>\n    <table class="col-sm-12">\n      <tr>\n        <td class="col-sm-4">\n          <select class="form-control" ng-model="newParam">\n            <option value="">--- ${Katrid.i18n.gettext('FILTERS')} ---</option>\n            <option ng-repeat="field in report.fields" value="\${ field.name }">\${ field.label }</option>\n          </select>\n        </td>\n        <td class="col-sm-8">\n          <button\n              class="btn btn-default" type="button"\n              ng-click="report.addParam(newParam)">\n            <i class="fa fa-plus fa-fw"></i> ${Katrid.i18n.gettext('Add Parameter')}\n          </button>\n        </td>\n      </tr>\n    </table>\n<div class="clearfix"></div>\n<hr>\n<div id="params-params">\n  <div ng-repeat="param in report.params" ng-controller="ReportParamController" class="row form-group">\n    <div class="col-sm-12">\n    <div class="col-sm-4">\n      <label class="control-label">\${param.label}</label>\n      <select ng-model="param.operation" class="form-control" ng-change="param.setOperation(param.operation)">\n        <option ng-repeat="op in param.operations" value="\${op.id}">\${op.text}</option>\n      </select>\n    </div>\n    <div class="col-sm-8" id="param-widget"></div>\n    </div>\n  </div>\n</div>\n</form>\n</div>`;
    }

  };

  this.Katrid.UI.Utils = {
    Templates: new Templates()
  };

}).call(this);

//# sourceMappingURL=ui.templ.js.map
