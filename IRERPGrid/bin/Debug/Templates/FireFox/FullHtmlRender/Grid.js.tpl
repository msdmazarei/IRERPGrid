var {{Grid.Name}}={
    Totalpages		: {{Grid.Totalpages}},
    Pageindex		: {{Grid.Pageindex}},
    Name			: "{{Grid.Name}}",
	Totalitems		: {{Grid.Totalitems}},
	Pagesize		:	{{Grid.Pagesize}},

	//Html Elements Ids & defines
	Divcontainerid	: "{{Grid.Divcontainerid}}",
	Tabledataid		: "{{Grid.Tabledataid}}",

	data : {%ToJson GridData Grid.DataColumns %}
};
