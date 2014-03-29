Grid Template
<br/>
<table>
<tr>
 {% for col in Grid.Columns %}
	<td>{{ col.Name }}</td>
 {% endfor %}
</tr>
</table>
{{Grid.Name}}