define('GridTable', ['require', 'exports', 'module', 'jquery', 'underscore', 'backbone'], function(require, exports, module) {

var $ = require('jquery');
var _ = require('underscore');

var EventEmitter = require('backbone').Events;

"use strict";

/****************************************************************************
 * View manager for Grid's main table body section
 */
var GridTable = Object.create( EventEmitter );
GridTable.init = function(tbody, totalPages) {
    this.$el = $(tbody);
    this.$el.prop('tabindex', '0');

    this.$activeRow = null;

    this.$el.on('mousedown', 'tr', _.bind(this._rowMouseDown, this));
    this.$el.keydown(_.bind(this._keydown, this));

    this.$el.on('mouseenter', 'tr', _.bind(this._rowMouseEnter, this));
};

GridTable.setContents = function(html) {
    this.$el.html(html);
    this.$activeRow = null;
};

GridTable._rowMouseEnter = function(e) {
    this.trigger('rowHover', $(e.target).parent());
};

GridTable._rowMouseDown = function(e) {
    this._activateRow($(e.target).parent());
};

GridTable._keydown = function(e) {
    var key = (e.which || e.keyCode);

    switch(key) {
    case 38:
    case 40:
        this._keyboardNav(key);
        e.preventDefault();

        break;
    }
};

GridTable._keyboardNav = function(key) {
    var $row;

    if (key == 40)
        if (this.$activeRow)
            $row = this.$activeRow.next();
        else
            $row = this.$el.children('tr:first');
    else
        if (this.$activeRow)
            $row = this.$activeRow.prev();
        else
            $row = this.$el.children('tr:last');

    this._activateRow($row);
};

GridTable._scrollIntoView = function($row) {
    var $container = this.$el.parents('.body-container');

    var docViewTop = $container.scrollTop();
    var docViewBottom = docViewTop + $container.height();

    var elemTop = $row.get(0).offsetTop;
    var elemBottom = elemTop + $row.height();

    if (elemTop < docViewTop)
        $row.get(0).scrollIntoView(true);
    else if (elemBottom > docViewBottom)
        $row.get(0).scrollIntoView(false);
};

GridTable._activateRow = function($row) {
    if ($row.length == 0) return;

    if (this.$activeRow)
        if (this.$activeRow.get(0) == $row.get(0))
            return;
        else
            this.$activeRow.removeClass('active');

    this.trigger('rowSelected', $row);

    this.$activeRow = $row;
    this.$activeRow.addClass('active');

    this._scrollIntoView($row);
};

return GridTable;
});
