(function(factory) {
    var root = this;

    root.IRERP.GridHeader =
        factory(window.jQuery, window._, Backbone.Events);
}(function($, _, EventEmitter) {
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
    var col = $(e.target),
        colName = col.data('column-name'),
        colOrder = col.data('column-sort-order') || 0;

    var orderMap = [null, 'asc', 'desc'];

    col.data('column-sort-order', (colOrder + 1) % 3);
    this.trigger('order', colName, orderMap[(colOrder + 1) % 3]);

    // TODO: put UI stuff here.
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
}));
