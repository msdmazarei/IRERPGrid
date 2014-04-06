
function fetchData(Grid, From, Count, sorts, criterias, afterSuccess, afterError) {
    
    console.log('fetch data called for grid:' + Grid.Name);
    if (From < 0) {
        console.log('from can not be less than 0');
        return;
    }

    callServerMethod('/IRERPControls/IRERPGrid/Fetch',
        {
            GridName:Grid.Name,
            From:From,
            Count: Count
        },
        function (data, textStatus, jqXHR, additionalParams) {
                DataRecivedFromServer('fetchData',data,textStatus,jqXHR,additionalParams);
            },
            'POST',
            {Grid:Grid,afterSuccess:afterSuccess,afterErrorL:afterError,RequestTime:Date.now()}
            );
}
function fetchDataCallBack(data, textStatus, jqXHR, additionalParams)
{
    if (additionalParams.Grid.LastfetchRequestTime != null
        &&
        additionalParams.Grid.LastfetchRequestTime > additionalParams.RequestTime
        ) {
        return;
    }

    additionalParams.Grid.LastfetchRequestTime = additionalParams.RequestTime;
    var Response = jQuery.parseJSON(data);
    var html = Response.data.HTML;
    var javascript = jQuery.parseJSON(Response.data.JavaScript);
    if (Object.keys(javascript).indexOf('ErrorCode') < 0) {
        //Success
        additionalParams.Grid.data = javascript.data;
        document.getElementById(additionalParams.Grid.Tabledataid).tBodies[0].innerHTML = html;

    }
    
    if(additionalParams.afterSuccess!=null)
    additionalParams.afterSuccess();
}

function Next(Grid) {
    if(Grid.Pageindex < Grid.Totalpages)
    {
        var from =(Grid.Pageindex+1) * Grid.Pagesize;
        
        fetchData(Grid, from, Grid.Pagesize,null,null,
            function () {
                Grid.Pageindex++;
            }, function () {
                console.log('some error happend');
            });
    }
}
function DataRecivedFromServer(CallType, data, textStatus, jqXHR, additionalParams)
{
    switch(CallType)
    {
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
