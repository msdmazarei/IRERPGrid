{% for row in GridData %}
<tr>
	{%for col in Grid.Columns %}
		<td>{% GGRCV row col %}</td>
	{%endfor%}
</tr>
{% endfor %}
