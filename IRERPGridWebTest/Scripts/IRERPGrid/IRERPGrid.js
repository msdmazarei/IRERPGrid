(function(yourcode) {
    yourcode(window.jQuery, window._, window.Backbone.Events, window, document);
}(function($, _, EventEmitter, window, document) {

/*********************************************************/
var GridCacheManager = {}

/*********************************************************/

var GridColumn = {

}
/****************************************************************************/
var GridDataSource = Object.create( EventEmitter );

GridDataSource.init = function(gridName) {
    this.uri = '/IRERPControls/IRERPGrid/Fetch';
    this.items = [];

    this.gridName = gridName;
    this.state = {
        currentPage: null,
        pageSize: 10,
        totalPages: null,
        totalItems: null,
        sort: null,
        filter: null
    };
};

GridDataSource.getPage = function(index, options) {
    options = options || {};
    var pageSize = this.state.pageSize,
        fromIndex = index * pageSize;

    return this._fetch({from: fromIndex, count: pageSize});
};

GridDataSource._fetch = function(options) {
    var that = this;
    var requestParams = {
        GridName: that.gridName,
        From: options.from,
        Count: options.count
    };
    this._ajax({
        url: this.uri,
        type: 'POST',
        data: requestParams,
        context: this
    }).then(_.bind(function(result) {
        this.items = result.items.json;

        _.extend(this.state, result.stats);

        this.trigger('refresh', result.items.html, this.state);
    }, this)).catch(function(error) {
        console.log(error);
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
}

/****************************************************************************/
var GridPager = Object.create( EventEmitter );
GridPager.init = function($pager, totalPages) {
    this.$el = $pager;

    this.reset(totalPages || 0);

    this.$el.on('click', 'button[rel]', _.bind(this._navButtonsClick, this));
};
GridPager.reset = function(totalPages, currentPage) {
    this.totalPages = totalPages;
    this.currentPage = currentPage || 0;

    // TODO: Put the UI stuff here.
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

/*********************************************************/
var Grid = {
    init: function(container, initializationOptions) {
        var options = initializationOptions || {};

        this.$container = $(container);
        this.$table = this.$container.children('table');
        this.$toolbar = this.$container.children('[role=toolbar]');

        var gridName = this.name = this.$container.data('grid-name');

        this.dataSource = Object.create( GridDataSource );
        this.dataSource.init(this.name);
        this.dataSource.on('refresh', this._refreshGrid, this);

        var pagerElem = this.$container.children('[role=navigation]');
        this.pager = Object.create( GridPager );
        this.pager.init(pagerElem, options.totalPages);
        this.pager.on('requestPage', this._requestPage, this)
    },

    _refreshGrid: function(itemsHTML, state) {
        this.pager.reset(state.totalPages, state.currentPage);
        this.$table.children('tbody').html(itemsHTML);
    },

    _requestPage: function(page) {
        this.dataSource.getPage(page);
        //console.log('Page changed to #' + this.pager.currentPage);
    }
};

$.fn.extend({
    IRERPGrid: function(options) {
        this.grid = Object.create( Grid );
        this.grid.init(this, options);

        return this.grid;
    }
});

/*********************************************************/
}));



/////////////// IRERPGrid Javascripts
//------------ Navigator Functions
function Grid_Next(Grid) {
    if (Grid.Pageindex < Grid.Totalpages)
        Grid_fetchData(Grid, Grid.Fromitemindex + Grid.Pagesize, Grid.Pagesize,null,null);
}
function Grid_Previous(Grid) {
    if (Grid.Pageindex > 0)
        Grid_fetchData(Grid, Grid.Fromitemindex - Grid.Pagesize, Grid.Pagesize, null, null);
}
function Grid_Last(Grid) {
    Grid_fetchData(Grid, (Grid.Totalpages-1) * Grid.Pagesize, Grid.Pagesize, null, null);
}
function Grid_First(Grid) {
    Grid_fetchData(Grid, 0, Grid.Pagesize, null, null);
}

//====================================

//------------ Fetch Data

function Grid_fetchData(Grid, From, Count, sorts, criterias, afterSuccess, afterError) {

    debuglog('fetch data called for grid:' + Grid.Name);
    if (From < 0) {
        debuglog('from can not be less than 0');
        return;
    }
    var requestParams = {
        GridName: Grid.Name,
        From: From,
        Count: Count,
    };
    if (sorts == null)
        sorts = Grid.Orders;
    if (sorts != null && sorts.length > 0)
        requestParams.ColumnsSorts = toJSON(sorts);

    callServerMethod('/IRERPControls/IRERPGrid/Fetch',
        requestParams,
        function (data, textStatus, jqXHR, additionalParams) {
            DataRecivedFromServer('fetchData', data, textStatus, jqXHR, additionalParams);
        },
            'POST',
            { Grid: Grid, afterSuccess: afterSuccess, afterError: afterError, RequestTime: Date.now() }
            );
}
function Grid_fetchDataCallBack(data, textStatus, jqXHR, additionalParams) {
    if (additionalParams.Grid.LastfetchRequestTime != null
        &&
        additionalParams.Grid.LastfetchRequestTime > additionalParams.RequestTime
        ) {
        return;
    }

    additionalParams.Grid.LastfetchRequestTime = additionalParams.RequestTime;
    var Response = jQuery.parseJSON(data);
    var html = Response.data.HTML;
    var jsonResult = jQuery.parseJSON(Response.data.JavaScript);
    var callAfterSuccess = function () { if (additionalParams.afterSuccess != null) additionalParams.afterSuccess(); };
    var callAfterError = function () { if (additionalParams.afterError != null) additionalParams.afterError(); };
    switch (
        Grid_fetchData_ProcessJSONResult(additionalParams.Grid, jsonResult)
        ) {
        case 'RENDER_ROWS':
            Grid_Render_fetchData_Html(additionalParams.Grid, html);
            callAfterSuccess();
            break;
        case 'ERROR':
            debuglog('ErrorCode:' + jsonResult.ErrorCode + ', Message:' + jsonResult.ErrorMessage);
            callAfterError();
            break;
    }
}
function Grid_fetchData_ProcessJSONResult(Grid, SrvResult) {
    if (Object.keys(SrvResult).indexOf('ErrorCode') < 0) {
        //Success
        Grid.data = SrvResult.data;
        Grid.Pageindex = SrvResult.Pageindex;
        Grid.Fromitemindex = SrvResult.Fromitemindex;
        Grid.Toitemindex = SrvResult.Toitemindex;
        Grid.Totalpages = SrvResult.Totalpages;
        Grid.Totalitems = SrvResult.Totalitems;
        return 'RENDER_ROWS';
    } else
    {
        return 'ERROR';
    }

}
//====================================

//------------ Grid Header Functions
function Grid_HeaderClick(Grid,colname) {
    debuglog(colname + ' Header Clicked for grid:' + Grid.Name);
    //TODO: Need to detect which action user need to do, default action is sort
    action = 'SORT';
    switch(action){
        case 'SORT':
            var colorder = Grid_Sort_GetColumnOrder(Grid, colname);
            if (colorder!=null) {
                    if (colorder.Ordertype == 'Asc')
                        Grid_Sort_AddColumnSort(Grid, colname, 'Desc');
                    else if (colorder.Ordertype == 'Desc')
                        Grid_Sort_RemoveColumnSort(Grid,colname);
                } else {
                        Grid_Sort_AddColumnSort(Grid, colname, 'Asc');
                }
            break;

    }
}
function Grid_Sort_GetColumnOrder(Grid, ColName) {
    if(Grid!=null)
    if (Grid.Orders != null && Grid.Orders.length > 0) {
        for (i = 0; i < Grid.Orders.length; i++) {

            if (Grid.Orders[i].Columnname == ColName)
                return Grid.Orders[i];
        }
    } else {
        Grid.Orders = [];
    }
    return null;
}
function Grid_Sort_AddColumnSort(Grid,ColName,SortType){
    var colorder = Grid_Sort_GetColumnOrder(Grid, ColName);
    if (colorder != null) {
        if (colorder.Ordertype != SortType) {
            colorder.Ordertype = SortType;
            Grid_First(Grid);
        }
    } else {
        colorder = { Columnname: ColName, Ordertype: SortType };
        Grid.Orders.push(colorder);
        Grid_First(Grid);
    }

}
function Grid_Sort_RemoveColumnSort(Grid, ColName) {
    var colorder = Grid_Sort_GetColumnOrder(Grid, ColName);
    if (colorder == null) return;
    var index = Grid.Orders.indexOf(colorder);
    Grid.Orders.splice(index, 1);
    Grid_First(Grid);
}

//====================================

//------------ General Functions

function debuglog(message) {
    console.log
    (message);
}
function DataRecivedFromServer(CallType, data, textStatus, jqXHR, additionalParams) {
    switch (CallType) {
        case 'fetchData':
            Grid_fetchDataCallBack(data, textStatus, jqXHR, additionalParams);
            break;

    }
}
function toJSON(obj) {
    return JSON.stringify(obj);
}
function callServerMethod(url, data, callbackfunction, CallType, additionalParams) {
    CallType = typeof CallType !== 'undefined' ? CallType : 'POST';
    $.ajax(
   {
       type: CallType,
       url: url,
       data: data,
       success: function (data, textStatus, jqXHR) {
           callbackfunction(data, textStatus, jqXHR, additionalParams);
       }
   }
   );
}

//====================================

//------------ Grid Renders Section
function Grid_Render_fetchData_Html(Grid, RowsHTML) {
    document.getElementById(Grid.Tabledataid).tBodies[0].innerHTML = RowsHTML;
}
//====================================

