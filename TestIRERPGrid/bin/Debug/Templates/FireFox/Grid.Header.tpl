<tr>
  {% for col in Grid.Columns %}
  
  
	<td>
    <a href="javascript:void(0)" onclick="Grid_HeaderClick({{Grid.Name}},'{{col.Name}}');">{{ col.Title }}</a>
    {% include Grid.Header.Filter.tpl  %}
  </td>
 {% endfor %}
</tr>