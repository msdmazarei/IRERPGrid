define('GridPager', ['require', 'exports', 'module', 'jquery', 'underscore', 'backbone'], function(require, exports, module) {

var $ = require('jquery');
var _ = require('underscore');

var EventEmitter = require('backbone').Events;

"use strict";

/****************************************************************************
 * View manager for Grid's pager section
 */
var GridPager = Object.create( EventEmitter );
GridPager.init = function(pager, totalPages) {
    this.$el = $(pager);

    this.reset(totalPages || 0);

    this.$el.on('click', 'button[rel]', _.bind(this._navButtonsClick, this));
};
GridPager.reset = function(totalPages, currentPage) {
    this.totalPages = totalPages;
    this.currentPage = currentPage || 0;

    // TODO: Put UI stuff (e.g. disabling nav buttons when appropriate) here.
    this.$el.children('.current-page').text(this.currentPage + 1 + ' / ' + this.totalPages);
};

GridPager._navButtonsClick = function(e) {
    var rel = $(e.target).attr('rel');
    var page = 0;

    switch (rel) {
        case 'first': page = 0; break;
        case 'previous': page = Math.max(0, this.currentPage - 1); break;
        case 'next': page = Math.min(this.currentPage + 1, this.totalPages); break;
        case 'last': page = this.totalPages - 1; break;
    }
    this.trigger('requestPage', page);
};

return GridPager;
});
