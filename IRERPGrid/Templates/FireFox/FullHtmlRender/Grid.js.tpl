var {{Grid.Name}}={
    Totalpages		: {{Grid.Totalpages}},
    Pageindex		: {{Grid.Pageindex}},
    Name			: "{{Grid.Name}}",
	Totalitems		: {{Grid.Totalitems}},
	Pagesize		: {{Grid.Pagesize}},
	"Fromitemindex"	: {{Grid.Fromitemindex}},
	"Toitemindex"	: {{Grid.Toitemindex}},
	"DataColumns"	:	{%ToJson Grid.Datacolumns%},
	"Columns"		:	{%ToJson Grid.Columns%},
	"Orders"		:	{%ToJson Grid.Orders%},
	"AdvancedCriterias"		:	{%ToJson Grid.Criterias%},
	"ClientColumnCriterias"	:	[],
	//Html Elements Ids & defines
	Divcontainerid	: "{{Grid.Divcontainerid}}",
	Tabledataid		: "{{Grid.Tabledataid}}",

	data : {%ToJson GridData Grid.Datacolumns %}
};
