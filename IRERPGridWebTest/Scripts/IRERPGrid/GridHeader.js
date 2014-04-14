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
    this.$el = $(header);

    this.$el.on('click', 'th', _.bind(this._onColumnClick, this));
};

GridHeader._onColumnClick = function(e) {
    var col = $(e.target),
        colName = col.data('column-name'),
        colOrder = col.data('column-sort-order') || 0;

    var orderMap = [null, 'asc', 'desc'];

    col.data('column-sort-order', (colOrder + 1) % 3);
    this.trigger('orderChanged', colName, orderMap[(colOrder + 1) % 3]);

    // TODO: put UI stuff here.
};

return GridHeader;
}));
