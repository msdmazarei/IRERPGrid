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

