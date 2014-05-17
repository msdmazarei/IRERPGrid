window.require(['jquery', 'Greed', 'jquery.mousewheel'], function($) {
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

        require(['GridDataSource', 'GridFormatter'], function(GridDataSource, GridFormatter) {
            var ds = Object.create( GridDataSource );
            ds.init({grid_name: "{{Grid.Name}}"});
            gridOptions.dataSource = ds;

            gridContainer.greed(gridOptions);
            var grid = gridContainer.data('greed');

            var formatterModal = Object.create( GridFormatter );
            formatterModal.init('#myModal');
            formatterModal.on('submit', function() {
                ds.formatters = formatterModal.items;
                grid.refresh();
                formatterModal.$el.modal('hide');
            });
        });
    });
});
