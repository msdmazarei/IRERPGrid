define('Grid', ['require', 'exports', 'module', 'jquery', 'GridDataSource', 'GridPager', 'GridHeader', 'GridTable'], function(require, exports, module) {

var $ = require('jquery');

var GridDataSource = require('GridDataSource');
var GridHeader = require('GridHeader');
var GridPager = require('GridPager');
var GridTable = require('GridTable');

var Grid = {
    init: function(container, options) {
        this._normalizeOptions(options);

        this.$container = $(container);
        this.$table = this.$container.children('table[role=grid]');
        this.$toolbar = this.$container.children('[role=toolbar]');

        this.name = this.$container.data('grid-name');
        this.columns = options.columns || {};

        this.dataSource = Object.create( GridDataSource );
        this.dataSource.init(this.name);
        this.dataSource.on('refresh', this._refreshGrid, this);

        this.header = Object.create( GridHeader );
        this.header.init(this.$table.children('thead'));
        this.header.on('order', this._columnOrderChanged, this);
        this.header.on('filter', this.filter, this);

        this.body = Object.create( GridTable );
        this.body.init(this.$table.children('tbody'));

        this.pager = Object.create( GridPager );
        this.pager.init(this.$container.children('[role=navigation]'), options.totalPages);
        this.pager.on('requestPage', this._requestPage, this);
    },

    refresh: function() {
        this._requestPage(0);
    },

    filter: function(filters) {
        this.dataSource.setFilter(filters);
        this.refresh();
    },

    _normalizeOptions: function(options) {
        options = options || {};

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

        this.options = options;
    },

    _refreshGrid: function(itemsHTML, state) {
        this.pager.reset(state.totalPages, state.currentPage);
        this.body.setContents(itemsHTML);
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
