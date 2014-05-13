window.require(['jquery', 'Grid'], function($) {
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
            Formatters      : [],       // ToJson Grid.Formatters
            //Html Elements Ids & defines
            Divcontainerid  : "{{Grid.Divcontainerid}}",
            Tabledataid     : "{{Grid.Tabledataid}}",

            data : {%ToJson GridData Grid.Datacolumns %}
        };

        require(['GridDataSource', 'GridFormatter', 'IRERP/IRERPGrid'], function(GridDataSource, GridFormatter) {
            var ds = Object.create( GridDataSource );
            ds.init("{{Grid.Name}}");

            gridOptions.dataSource = ds;
            window.grids.push(gridContainer.IRERPGrid(gridOptions));

            var formatterModal = Object.create( GridFormatter );
            formatterModal.init('#myModal');
            formatterModal.on('submit', function() {
                ds.setFormatter(formatterModal.items);
            });
        });
    });
});
