(function(yourcode) {
    yourcode(window.jQuery, window.Backbone.Events, window, document);
}(function($, EventEmitter, window, document) {
    $(function() {

/*********************************************************/
var GridCacheManager = {}

/*********************************************************/

var GridColumn = {

}
/****************************************************************************/
var GridDataSource = Object.create( EventEmitter );
GridDataSource.init = function(uri) {
    this.uri = '/IRERPControls/IRERPGrid/Fetch';
    this.items = [];

    this.state = {
        currentPage: null,
        pageSize: 15,
        totalPages: null,
        totalItems: null,
        sort: null,
        filter: null
    };
};
GridDataSource.fetch = function(requestParams) {
    $.ajax({ url: this.uri, type: 'POST', data: requestParams, context: this })
     .done(function(data) {
        var result = $.parseJSON(data);
        console.log(result);
        var jsonResult = $.parseJSON(result.data.JavaScript);

        this.items = jsonResult.data;
        this.totalItems = jsonResult.Totalitems;

        this.trigger('refresh', {
            itemsHTML: jsonResult.data.HTML,
            totalPages: jsonResult.Totalpages
        });
    });
};

/****************************************************************************/
var GridPager = Object.create( EventEmitter );
GridPager.init = function($pager, totalPages) {
    this.$el = $pager;

    this.reset(totalPages || 0)

    var that = this;
    this.$el.on('click', 'button[rel]', function(e) {
        var rel = $(e.target).attr('rel');
        that['_' + rel + 'Page'].apply(that);
        that.trigger('pageChanged', that.currentPage);
    });
};
GridPager.reset = function(totalPages, currentPage) {
    this.totalPages = totalPages;
    this._gotoPage(currentPage || 0);
}

GridPager._nextPage = function() {
    this._gotoPage(this.currentPage + 1);
};
GridPager._previousPage = function() {
    this._gotoPage(this.currentPage - 1);
};
GridPager._firstPage = function() {
    this._gotoPage(0);
};
GridPager._lastPage = function() {
    this._gotoPage(this.totalPages - 1);
};
GridPager._gotoPage = function(page) {
    page = Math.max(0, Math.min(page, this.totalPages - 1));

    // TODO: Put the UI stuff here.
};

/*********************************************************/
var Grid = {
    init: function(container) {
        console.log('Grid.init');

        this.$container = $(container);
        this.$table = this.$container.children('table');
        this.$toolbar = this.$container.children('[role=toolbar]');

        var gridName = this.name = this.$container.data('grid-name');

        this.dataSource = Object.create( GridDataSource );
        this.dataSource.init(this.name);
        this.dataSource.on('refresh', this._dataSourceRefresh, this);

        this.pager = Object.create(GridPager);
        this.pager.init(this.$container.children('[role=navigation]'));
        this.pager.on('pageChanged', this._pageChanged, this)
    },

    _dataSourceRefresh: function(result) {
        this.pager.reset(result.totalPages);
        this.$table.children('tbody').html(result.itemsHTML);
        console.log(this.dataSource.items);
    },

    _pageChanged: function(page) {
        this.dataSource.fetch({
            page: page
        });
        console.log('Page changed to #' + this.pager.currentPage);
    }
};

$.fn.extend({
    IRERPGrid: function() {
        this.grid = Object.create(Grid);
        this.grid.init(this);
    }
});

var gridContainer = window.grid = $('[data-grid-name]');
gridContainer.IRERPGrid();

/*********************************************************/
    });
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

