define(['underscore'], function(_) {

var GridDataSource = Object.create( {}, {
    page: {
        get: function() { return internal_state.currentPage },
        set: function(page) {
            request_state.from = page * internal_state.pageSize;
        }
    },
    filter: {
        get: function() { return _.clone(internal_state.filter) },
        set: function(filters) {
            request_state.filter = filters;
            this.page = 0;
        }
    },
    formatters: {
        get: function() { return _.clone(internal_state.formatters) },
        set: function(formatters) {
            request_state.formatters = formatters;
        }
    },
    sort: {
        get: function() { return _.clone(internal_state.sort) }
    }
});

var request_state = {},
    internal_state = {
        currentPage: null,
        from: 0,
        pageSize: 10,
        totalPages: null,
        totalItems: null,
        sort: {},
        filter: {},
        formatters: []
    },
    items = [],

    active_fetch_request = null,

    fetch_uri,
    grid_name;

GridDataSource.init = function(options) {
    fetch_uri = (options.uri || '') + '/IRERPControls/IRERPGrid/Fetch';
    grid_name = options.grid_name;
};

GridDataSource.refresh = function() {
    return fetch();
};

GridDataSource.sortBy = function(columnName, order) {
    if (!request_state.sort)
        request_state.sort = {};
    request_state.sort[columnName] = order;
    this.page = 0;
};

function fetch() {
    function getRequestState() {
        var s = _.extend({}, internal_state, request_state);
        
        if (request_state.sort) {
            s.sort = {};
            Object.keys(internal_state.sort).forEach(function(key) {
                if (request_state.sort[key] !== null)
                    s.sort[key] = internal_state.sort[key];
            });
            Object.keys(request_state.sort).forEach(function(key) {
                if (request_state.sort[key] !== null)
                    s.sort[key] = request_state.sort[key];
            });
        }

        return s;
    }
    function getRequestParams() {
        return {
            GridName: grid_name,
            From: state.from,
            Count: state.pageSize,

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
        active_fetch_request = null;

        items = result.items.json;

        // Merge result.stats with internal_state
        _.extend(internal_state, state, result.stats);
        request_state = {};

        return {
            html: result.items.html,
            state: internal_state
        };
    }

    if (active_fetch_request !== null)
        active_fetch_request.abort();

    var state = getRequestState();

    return ajax({
        url: fetch_uri,
        type: 'POST',
        data: getRequestParams(),
        beforeSend: function(jqXHR) {
            active_fetch_request = jqXHR;
        }
    }).then(fetchWasSuccessful);
}

function ajax() {
    /*** Geneva agreement! ***/
    function convertResult(data) {
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
    }

    /* Unexptected HTTP errors */
    function httpException(xhr) {
        throw { ErrorCode: xhr.status, ErrorMessage: xhr.statusText };
    }

    return post.apply(null, arguments).then(convertResult, httpException);
}

function post(options) {
    function convertData(obj) {
        return Object.keys(obj).map(function(key) {
            return key + "=" + encodeURIComponent(obj[key]);
        }).join("&");
    }
    // Return a new promise.
    return new Promise(function(resolve, reject) {
        // Do the usual XHR stuff
        var req = new XMLHttpRequest();
        req.open('POST', options.url);
        req.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
        
        req.onload = function() {
            // This is called even on 404 etc
            // so check the status
            if (req.status == 200) {
                // Resolve the promise with the response text
                resolve(req.response);
            } else {
                // Otherwise reject with the status text
                // which will hopefully be a meaningful error
                reject(Error(req.statusText));
            }
        };

        // Handle network errors
        req.onerror = function() {
            reject(Error("Network Error"));
        };

        // Make the request
        if (options.beforesend)
            options.beforesend(req);
        var data = convertData(options.data)
        req.send(data);
    });
}

return GridDataSource;

});
