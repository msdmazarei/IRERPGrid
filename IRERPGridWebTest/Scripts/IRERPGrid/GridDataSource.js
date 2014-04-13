(function(factory) {
    var root = this;

    root.IRERP.GridDataSource =
        factory(window.jQuery, window._, window.Q, Backbone.Events);
}(function($, _, Q, EventEmitter) {
    "use strict";

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
        filter: null
    };
};

GridDataSource.getPage = function(index, options) {
    options = options || {};
    var pageSize = this.state.pageSize,
        fromIndex = index * pageSize;

    return this._fetch({from: fromIndex, count: pageSize});
};

GridDataSource.sortBy = function(columnName, order) {
    if (_.isString(columnName))
        this.state.sort[columnName] = order;
    else // if (_.isObject(columnName) )
        _.extend(this.state.sort, columnName);
};
GridDataSource.sortOff = function(columnName) {
    delete this.state.sort[columnName];
}

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
    ).catch(function(error) {
        console.log('ErrorCode:', error.ErrorCode, ', Message:', error.ErrorMessage);
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

}));
