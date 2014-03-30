
function Next(Grid) {
    console.log(Grid.Totalpages);
    callServerMethod(
        '/IRERPControls/IRERPGrid/Next',
        { GridName: Grid.Name },
        function (data, textStatus, jqXHR, additionalParams) { DataRecivedFromServer('Next', data, textStatus, jqXHR, additionalParams); },
        'POST',
        {GridName: Grid.Name}
        );
}
function NextCallBack(data, textStatus, jqXHR, additionalParams)
{
    document.getElementById("GridContainer-" + additionalParams.GridName).removeNode(true);
}

function DataRecivedFromServer(CallType, data, textStatus, jqXHR, additionalParams)
{
    if (CallType == 'Next')
        NextCallBack(data, textStatus, jqXHR, additionalParams);
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
