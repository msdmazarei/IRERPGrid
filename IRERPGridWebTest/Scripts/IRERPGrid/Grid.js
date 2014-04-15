define('Grid', ['require', 'exports', 'module', 'jquery', 'GridDataSource', 'GridPager', 'GridHeader'], function(require, exports, module) {

var $ = require('jquery');

var GridDataSource = require('GridDataSource');
var GridHeader = require('GridHeader');
var GridPager = require('GridPager');

var Grid = {
    init: function(container, initializationOptions) {
        var options = initializationOptions || {};

        this.$container = $(container);
        this.$table = this.$container.children('table[role=grid]');
        this.$toolbar = this.$container.children('[role=toolbar]');

        var gridName = this.name = this.$container.data('grid-name');

        this.dataSource = Object.create( GridDataSource );
        this.dataSource.init(this.name);
        this.dataSource.on('refresh', this._refreshGrid, this);

        var headerElem = this.$table.children('thead');
        this.header = Object.create( GridHeader );
        this.header.init(headerElem);
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
