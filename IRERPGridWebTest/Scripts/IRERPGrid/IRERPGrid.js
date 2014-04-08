
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
    //Sorts
    if (sorts == null)
        sorts = Grid.Orders;
    if (sorts != null && sorts.length > 0)
        requestParams.ColumnsSorts = toJSON(sorts);

    //Client Crits
    var clientcrits = Grid_Filter_getClientColumnCriterias(Grid);
    if (clientcrits != null && clientcrits.length > 0)
        requestParams.ClientColumnCriteria = toJSON(clientcrits);
    //Advance Criterias
    var advcrits = Grid_Filter_getAdvancedCriterias(Grid);
    if (advcrits != null && advcrits.length > 0)
        requestParams.AdvancedCriterias = toJSON(advcrits);

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
//------------Grid Filter Functions
// Grid Supports 2 Different Criteria Mode, First ClientColumnCriteria, and AdvanceCriteria
// One of them must send to server for a fetch not Both, if Both Sends to Server, Server Return 
// Result of filter: AdvanceCriteria && ClientColumnCriteria, 
// AdvancedCriteria is collection of MsdCriteria {operator:"",Field:"",Values:""}
// CliemtColumnCriteria is collection of POJOS {Columnname:"",Condition:""}

function Grid_Filter_DoFilter(Grid) {
    Grid_Filter_MakeClientColumnCriterias(Grid);
    Grid_First(Grid);
}
function Grid_Filter_getClientColumnCriterias(Grid) {
    if (Grid.ClientColumnCriteria == null)
        Grid.ClientColumnCriteria = [];
    return Grid.ClientColumnCriteria;
}
function Grid_Filter_getClientColumnCriteriaForCol(Grid, ColName) {
    var crits = Grid_Filter_getClientColumnCriterias();
    if (crits.length > 0)
        for (i = 0; i < crits.length; i++)
            if (crits[i].Columnname == ColName)
                return crits[i];
}
function Grid_Filter_AddClientColumnCriteria(Grid, ColName, Condition) {
    Grid_Filter_getClientColumnCriterias(Grid).push({ Columnname: ColName, Condition: Condition });
}
function Grid_Filter_ClearClientColumnCriterias(Grid) {
    var crits = Grid_Filter_getClientColumnCriterias(Grid);
    clearArray(crits);
}
function Grid_Filter_MakeClientColumnCriterias(Grid) {
    //Clear Old Values
    Grid_Filter_ClearClientColumnCriterias(Grid);
    //Get HTML FORM
    var filterform = Grid_Filter_getHeaderFilterForm(Grid);
    if (filterform != null) {
        if(filterform.length>0)
            for (i = 0; i < filterform.length; i++) {
                var formitem = filterform[i]; 
                var columnname = formitem.dataset.columnname; //Get Column Name
                var columncondition = formitem.value; // Get Column Filter

                if (columnname != null && columnname != '' && columncondition != null && columncondition != '')
                    Grid_Filter_AddClientColumnCriteria(Grid, columnname, columncondition);
            }
    }

}
function Grid_Filter_getHeaderFilterForm(Grid) {
    for (i = 0; i < document.forms.length; i++)
        if (document.forms[i].id == Grid_Filter_getHeaderFilterFormId(Grid))
            return document.forms[i];
}
function Grid_Filter_getHeaderFilterFormId(Grid) {
    return Grid.Tabledataid + '-HeaderForm';
}

function Grid_Filter_getAdvancedCriterias(Grid) {
    if (Grid.AdvancedCriterias == null)
        Grid.AdvancedCriterias = [];
    return Grid.AdvancedCriterias;
}
       

//====================================

//------------ General Functions

function debuglog(message) {
    console.log
    (message);
}
function clearArray(array) {
    //Here the fastest working implementation while keeping the same array:
    //ref: http://stackoverflow.com/questions/1232040/how-to-empty-an-array-in-javascript
    if (array != null && array.length > 0)
        while (array.length > 0)
            array.pop();
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

