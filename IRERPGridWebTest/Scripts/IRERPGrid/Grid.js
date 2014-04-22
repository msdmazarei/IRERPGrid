define('Grid', ['require', 'exports', 'module', 'jquery', 'GridDataSource', 'GridPager', 'GridHeader'], function(require, exports, module) {

var $ = require('jquery');

var GridDataSource = require('GridDataSource');
var GridHeader = require('GridHeader');
var GridPager = require('GridPager');

var Grid = {
    init: function(container, initializationOptions) {
        var options = this._normalizeOptions(initializationOptions || {});

        this.$container = $(container);
        this.$table = this.$container.children('table[role=grid]');
        this.$toolbar = this.$container.children('[role=toolbar]');

        var gridName = this.name = this.$container.data('grid-name');
        this.columns = options.columns || {};

        this.dataSource = Object.create( GridDataSource );
        this.dataSource.init(this.name);
        this.dataSource.on('refresh', this._refreshGrid, this);

        var headerElem = this.$table.children('thead');
        this.header = Object.create( GridHeader );
        this.header.init(headerElem, options.columns);
        this.header.on('order', this._columnOrderChanged, this);
        this.header.on('filter', this.filter, this)

        var pagerElem = this.$container.children('[role=navigation]');
        this.pager = Object.create( GridPager );
        this.pager.init(pagerElem, options.totalPages);
        this.pager.on('requestPage', this._requestPage, this)
    },

    refresh: function() {
        this._requestPage(0);
    },

    filter: function(filters) {
        this.dataSource.filterByColumn(filters);
        this.refresh();
    },

    _normalizeOptions: function(options) {
        if (!options) return;

        if (_.has(options, 'DataColumns')) {
            options.columns = _.indexBy(options.DataColumns, 'Name');
            delete options.DataColumns;
        }

        if (_.has(options, 'Columns')) {
            if (_.isEmpty(options.columns))
                options.columns = _.indexBy(options.Columns, 'Name');

            _.forEach(options.Columns, function(col) {
                options.columns[col.Name].visible = true;
            });

            delete options.Columns;
        }
    },

    _refreshGrid: function(itemsHTML, state) {
        this.pager.reset(state.totalPages, state.currentPage);
        this.$table.children('tbody').html(itemsHTML);
    },

    _requestPage: function(page) {
        this.dataSource.getPage(page);
    },

    _columnOrderChanged: function(columnName, order) {
        this.dataSource.sort(columnName, order);
        this.refresh();
    }
};

return Grid;

});
