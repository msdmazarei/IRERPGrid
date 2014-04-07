
/////////////// IRERPGrid Javascripts
//------------ Navigator Functions
function Grid_Next(Grid) {
    if (Grid.Pageindex < Grid.Totalpages) 
        fetchData(Grid, Grid.Fromitemindex + Grid.Pagesize, Grid.Pagesize,null,null);
}
function Grid_Previous(Grid) {
    if (Grid.Pageindex > 0) 
        fetchData(Grid, Grid.Fromitemindex - Grid.Pagesize, Grid.Pagesize, null, null);
}
function Grid_Last(Grid) {
    fetchData(Grid, (Grid.Totalpages-1) * Grid.Pagesize, Grid.Pagesize, null, null);
}
function Grid_First(Grid) {
    fetchData(Grid, 0, Grid.Pagesize, null, null);
}

//-----------------------------------

//------------ Fetch Data
function fetchData(Grid, From, Count, sorts, criterias, afterSuccess, afterError) {
    debuglog('fetch data called for grid:' + Grid.Name);
    if (From < 0) {
        debuglog('from can not be less than 0');
        return;
    }

    callServerMethod('/IRERPControls/IRERPGrid/Fetch',
        {
            GridName: Grid.Name,
            From: From,
            Count: Count
        },
        function (data, textStatus, jqXHR, additionalParams) {
            DataRecivedFromServer('fetchData', data, textStatus, jqXHR, additionalParams);
        },
            'POST',
            { Grid: Grid, afterSuccess: afterSuccess, afterErrorL: afterError, RequestTime: Date.now() }
            );
}
function fetchDataCallBack(data, textStatus, jqXHR, additionalParams) {
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
        fetchData_ProcessJSONResult(additionalParams.Grid, jsonResult)
        ) {
        case 'RENDER_ROWS':
            Render_fetchData_Html(additionalParams.Grid, html);
            callAfterSuccess();
            break;
        case 'ERROR':
            debuglog('ErrorCode:' + jsonResult.ErrorCode + ', Message:' + jsonResult.ErrorMessage);
            callAfterError();
            break;
    }
}
function fetchData_ProcessJSONResult(Grid, SrvResult) {
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
//------------------------------------


//------------ General Functions
function debuglog(message) {
}
function DataRecivedFromServer(CallType, data, textStatus, jqXHR, additionalParams) {
    switch (CallType) {
        case 'fetchData':
            fetchDataCallBack(data, textStatus, jqXHR, additionalParams);
            break;

    }
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

//------------------------------------

//------------ Grid Renders Section
function Render_fetchData_Html(Grid, RowsHTML) {
    document.getElementById(Grid.Tabledataid).tBodies[0].innerHTML = RowsHTML;
}
//------------------------------------

