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
    this.$container = $(header);
    this.$headers = this.$container.children('.column-headers');

    this.filters = {};

    this.$headers.on('click', 'li > a.header', _.bind(this._onHeaderClick, this));
    this.$headers.on('click', 'li > a.header-menu', _.bind(this._onHeaderMenuClick, this));

    this.$headers.on('keyup', 'li.filter > input', _.bind(this._onFilterKeyup, this));
    this.$headers.on('keypress', 'li.filter > input', _.bind(this._onFilterKeypress, this));
};

GridHeader._onHeaderClick = function(e) {
    var col, $target = $(e.target);

    if ($(e.target).parent().hasClass('column-headers'))
        col = $target;
    else
        col = $target.parents('.column-headers > li');

    var colName = col.data('name'),
        colOrder = col.data('column-sort-order') || 0;

    var orderMap = [null, 'asc', 'desc'];
    var colOrderClass = orderMap[(colOrder + 1) % 3];

    col.data('column-sort-order', (colOrder + 1) % 3);
    col.attr('class', colOrderClass);

    this.trigger('order', colName, colOrderClass);
};

GridHeader._onHeaderMenuClick = function(e) {
    var $header = $(e.target).parent();

    // TODO: This is temporary. Fix it.
    if ($header.hasClass('filter'))
        this._hideFilter($header);
    else
        this._showFilter($header);
};

GridHeader._onFilterKeyup = function(e) {
    var key = e.which || e.keyCode;

    switch(key) {
    case 27:
        this._hideFilter($(e.target).parent());
        break;
    }
};

GridHeader._onFilterKeypress = function(e) {
    var key = e.which || e.keyCode;

    switch(key) {
    case 13:
        this._enterFilter($(e.target).parent());
        break;
    }
}

GridHeader._enterFilter = function($header) {
    var $textbox = $header.children('input');
    var $headerTitle = $header.children('a.header');

    var fieldName = $header.data('name');
    var filter = $textbox.val();

    if (filter != this.filters[fieldName]) {
        if (_.isEmpty(filter)) {
            delete this.filters[fieldName];
            $headerTitle.children('span').remove();
        } else {
            this.filters[fieldName] = filter;
            $headerTitle.children('span').remove();
            $headerTitle.append($('<span>' + filter + '</span>'));
        }

        this.trigger('filter', this.filters);

        this._hideFilter($header);
    }
};

GridHeader._showFilter = function($header) {
    $header.addClass('filter');
    $header.children('input').focus();
};
GridHeader._hideFilter = function($header) {
    var $textbox = $header.children('input');
    var fieldName = $header.data('name');

    $textbox.val(this.filters[fieldName]);

    $header.removeClass('filter');
};

//     if (e.which == 13) {
//         var filters = {};
//         this.$filters.children('th').each(function(index, el) {
//             var $el = $(el).children('input');

//             if (!_.isEmpty($el.val()))
//                 filters[$el.data('name')] = $el.val();
//         });
//         this.trigger('filter', filters);

//         // Select text inside active filter box
//         $(e.target).select();

//         e.preventDefault();

//     }
// };

return GridHeader;
});
