(function(yourcode) {
    yourcode(window.jQuery, window);
}(function($, window) {
    $(function() {
        window.grids = [];

        var gridContainer = window.grid = $('[data-grid-name]');

        var gridOptions={
            totalPages      : {{Grid.Totalpages}},
            currentPage     : {{Grid.Pageindex}},
            gridName        : "{{Grid.Name}}",
            totalItems      : {{Grid.Totalitems}},
            pageSize        : {{Grid.Pagesize}},
            from            : {{Grid.Fromitemindex}},
            to              : {{Grid.Toitemindex}},
            DataColumns     :   {%ToJson Grid.Datacolumns%},
            Columns         :   {%ToJson Grid.Columns%},
            Orders          :   {%ToJson Grid.Orders%},
            AdvancedCriterias     :   {%ToJson Grid.Criterias%},
            ClientColumnCriterias :   [],
            //Html Elements Ids & defines
            Divcontainerid  : "{{Grid.Divcontainerid}}",
            Tabledataid     : "{{Grid.Tabledataid}}",

            data : {%ToJson GridData Grid.Datacolumns %}
        };

        window.grids.push(gridContainer.IRERPGrid(gridOptions));
    });
}));
