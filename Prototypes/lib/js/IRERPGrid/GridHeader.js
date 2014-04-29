define('GridHeader', ['require', 'exports', 'module', 'jquery', 'underscore', 'backbone'], function(require, exports, module, $, _) {

var $ = require('jquery');
var _ = require('underscore');

var EventEmitter = require('backbone').Events;

"use strict";

/****************************************************************************
 * View manager for Grid's THEAD section
 */
var GridHeader = Object.create( EventEmitter );

GridHeader.init = function( header ) {
    this.$filters = $(header).children('tr.column-filters');
    this.$headers = $(header).children('tr.column-headers');

    this.$headers.on('click', 'th', _.bind(this._onColumnClick, this));
    this.$filters.on('keypress', 'input', _.bind(this._onFilter, this));
};

GridHeader._onColumnClick = function(e) {
    var col, $target = $(e.target);

    if (e.target.localName === 'th')
        col = $target;
    else
        col = $target.parents('th');

    var colName = col.data('column-name'),
        colOrder = col.data('column-sort-order') || 0;

    var orderMap = [null, 'asc', 'desc'];
    var colOrderClass = orderMap[(colOrder + 1) % 3];

    col.data('column-sort-order', (colOrder + 1) % 3);
    col.attr('class', colOrderClass);

    this.trigger('order', colName, colOrderClass);
};

GridHeader._onFilter = function(e) {
    if (e.which == 13) {
        var filters = {};
        this.$filters.children('th').each(function(index, el) {
            var $el = $(el).children('input');

            if (!_.isEmpty($el.val()))
                filters[$el.data('column-name')] = $el.val();
        });
        this.trigger('filter', filters);

        // Select text inside active filter box
        $(e.target).select();

        e.preventDefault();
    }
};

return GridHeader;
});
