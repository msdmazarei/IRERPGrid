Grid Template For Grid {{Grid.Name}}
<br/>
<table>
<tr>
 {% for col in Grid.Columns %}
	<td>{{ col.Name }}</td>
 {% endfor %}
</tr>
{% for row in GridData %}
<tr>
	{%for col in Grid.Columns %}
		<td>{% GGRCV row col %}</td>
	{%endfor%}
</tr>
{% endfor %}
</table>
