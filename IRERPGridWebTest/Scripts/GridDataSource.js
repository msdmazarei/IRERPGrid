define(['require', 'exports', 'module', 'jquery', 'q', 'underscore'], function(require, exports, module) {

var _ajax = require('jquery').ajax;
var Q = require('q');
var _ = require('underscore');

var EventEmitter = require('IRERP/lib/backbone-events');

var GridDataSource = Object.create( EventEmitter, {
    requestState: {
        get: function() {
            var state = { sort: {}, filter: {} };

            state.filter = _.clone(this._requestState.filter);
            state.sort = _.clone(this._requestState.sort);

            _.each(this._requestState.sort,
                function(order, field) {
                    if (order !== null)
                        state.sort[field] = order;
                    else
                        delete state.sort[field];
                }
            );

            return state;
        }
    }
});


GridDataSource.init = function(gridName, uri) {
    this.uri = (uri || '') + '/IRERPControls/IRERPGrid/Fetch';
    this.items = [];

    this.activeFetchRequest = null;

    this.gridName = gridName;
    this.state = {
        currentPage: null,
        pageSize: 10,
        totalPages: null,
        totalItems: null,
        sort: {},
        filter: {},
        formatters: []
    };

    this._requestState = { sort: {}, filter: {}, formatters: [] };
};

GridDataSource.getPage = function(index) { //, options) {
    var pageSize = this.state.pageSize,
        fromIndex = index * pageSize;

    var options = {from: fromIndex, count: pageSize};

    return this._fetch(options);
};

GridDataSource.sort = function(columnName, order) {
    this._requestState.sort[columnName] = order;
};

GridDataSource.setFormatter = function(formatters) {
    this._requestState.formatters = formatters;
};

GridDataSource.setFilter = function(filters) {
    this._requestState.filter = filters;
};

GridDataSource._fetch = function(options) {
    function getRequestParams() {
        return {
            GridName: that.gridName,
            From: options.from,
            Count: options.count,

            ColumnsSorts: JSON.stringify(
                _.map(state.sort,
                    function(order, colName) {
                        return { Columnname: colName, Ordertype: order };
                    }
                )
            ),

            ClientColumnCriteria: JSON.stringify(
                _.map(state.filter,
                    function(filter, colName) {
                        return { Columnname: colName, Condition: filter };
                    }
                )
            ),

            RowFormatters: JSON.stringify( state.formatters )
        };
    }
    function fetchWasSuccessful(result) {
        this.activeFetchRequest = null;

        this.items = result.items.json;

        // Merge result.stats with this.state
        _.extend(this.state, state, result.stats);

        this.trigger('refresh', result.items.html, this.state);
    };

    if (this.activeFetchRequest !== null)
        this.activeFetchRequest.abort();

    var state = this.requestState;
    var that = this;

    return this._ajax({
        url: this.uri,
        type: 'POST',
        data: getRequestParams(),
        context: this,
        beforeSend: function(jqXHR) {
            this.activeFetchRequest = jqXHR;
        }
    }).then(fetchWasSuccessful.bind(this));
};

/*** Geneva agreement! ***/
GridDataSource._ajax = function() {
    return Q(_ajax.apply($, arguments)).then(
        function(data) {
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
        },
        /* Unexptected HTTP errors */
        function(xhr) {
            throw { ErrorCode: xhr.status, ErrorMessage: xhr.statusText };
        }
    );
};

return GridDataSource;

});
