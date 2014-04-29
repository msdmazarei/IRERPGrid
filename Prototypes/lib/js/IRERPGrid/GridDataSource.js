define('GridDataSource', ['require', 'exports', 'module', 'jquery', 'underscore', 'backbone', 'q'], function(require, exports, module) {

var $ = require('jquery');
var _ = require('underscore');
var Q = require('q');
var EventEmitter = require('backbone').Events;

var GridDataSource = Object.create( EventEmitter );

GridDataSource.init = function(gridName) {
    this.uri = '/IRERPControls/IRERPGrid/Fetch';
    this.items = [];

    this.activeFetchRequest = null;

    this.gridName = gridName;
    this.state = {
        currentPage: null,
        pageSize: 10,
        totalPages: null,
        totalItems: null,
        sort: {},
        filter: {}
    };
};

GridDataSource.getPage = function(index, options) {
    options = options || {};
    var pageSize = this.state.pageSize,
        fromIndex = index * pageSize;

    return this._fetch({from: fromIndex, count: pageSize});
};

GridDataSource.sort = function(columnName, order) {
    if (order != null)
        this.state.sort[columnName] = order;
    else
        delete this.state.sort[columnName];
};

GridDataSource.setFilter = function(filters) {
    this.state.filter = filters;
};

GridDataSource._fetch = function(options) {
    if (this.activeFetchRequest !== null)
        this.activeFetchRequest.abort();

    var that = this;
    var requestParams = {
        GridName: that.gridName,
        From: options.from,
        Count: options.count,

        ColumnsSorts: JSON.stringify(_.map(this.state.sort, function(order, colName) {
            return { Columnname: colName, Ordertype: order };
        })),

        ClientColumnCriteria: JSON.stringify(_.map(this.state.filter, function(filter, colName) {
            return { Columnname: colName, Condition: filter };
        }))
    };

    this._ajax({
        url: this.uri,
        type: 'POST',
        data: requestParams,
        context: this,
        beforeSend: function(jqXHR) {
            this.activeFetchRequest = jqXHR;
        }
    }).then(_.bind(
        function(result) {
            this.activeFetchRequest = null;

            this.items = result.items.json;

            // Merge result.stats with this.state
            _.extend(this.state, result.stats);

            this.trigger('refresh', result.items.html, this.state);
        }, this)
    ).fail(function(error) {
        if (error.ErrorCode)
            console.error('ErrorCode:', error.ErrorCode, ', Message:', error.ErrorMessage);
        else
            throw error;
    }).done();
};

/*** Geneva agreement! ***/
GridDataSource._ajax = function() {
    return Q($.ajax.apply($, arguments)).then(function(data) {
        var result = $.parseJSON(data);
        var jsonResult = $.parseJSON(result.data.JavaScript);

        /* Expected application errors */
        if ( 'ErrorCode' in jsonResult )
            throw jsonResult;
        else
            return {
                items: {
                    json: jsonResult.data,
                    html: result.data.HTML
                },
                stats: {
                    totalPages: jsonResult.Totalpages,
                    currentPage: jsonResult.Pageindex,
                    totalItems: jsonResult.Totalitems
                }
            };
    }, /* Unexptected HTTP errors */ function(xhr) {
        throw { ErrorCode: xhr.status, ErrorMessage: xhr.statusText };
    });
};

return GridDataSource;

});
