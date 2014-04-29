define('jquery-irerp-grid', ['require', 'exports', 'module', 'jquery', 'Grid'], function(require, exports, module) {

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

var $ = require('jquery');
var Grid = require('Grid');

$.fn.extend({
    IRERPGrid: function(options) {
        this.grid = Object.create( Grid );
        this.grid.init(this, options);

        return this.grid;
    }
});

});
