<div id="GridContainer-{{Grid.Name}}">
Grid Template For Grid {{Grid.Name}}
<br/>
<table data-GridName="{{Grid.Name}}">
<tr>
 {% for col in Grid.Columns %}
	<td>{{ col.Title }}</td>
 {% endfor %}
</tr>
{% for row in GridData %}
<tr>
	{%for col in Grid.Columns %}
		<td>{% GGRCV row col %}</td>
	{%endfor%}
</tr>
{% endfor %}
{% comment %}
Pager Section
{% endcomment %}
<button onclick="Next({{Grid.Name}})">Next</button>

</table>
</div>