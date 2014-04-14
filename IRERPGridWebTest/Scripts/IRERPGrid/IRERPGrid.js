(function(factory) {
    var root = this;

    factory(window.jQuery, root.IRERP.Grid);
}(function($, Grid) {
    "use strict";

/*********************************************************
 * GridCacheManager -                   * currently stub *
 *********************************************************/
var GridCacheManager = {};

/*********************************************************
 * GridColumn -                         * currently stub *
 *********************************************************/
var GridColumn = {
    name: 'columnName',
    display: 'Column Name',
    order: null,    /* 'asc' or 'desc' or null */
    filter: null,   /* a string or an object */
    valueMap: function( value ) { return value; },
    cssMap: function( value ) { return null }
};

$.fn.extend({
    IRERPGrid: function(options) {
        this.grid = Object.create( Grid );
        this.grid.init(this, options);

        return this.grid;
    }
});

}));
