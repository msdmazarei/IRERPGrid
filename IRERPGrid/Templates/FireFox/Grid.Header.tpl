<thead>
  <form name="{{Grid.Tabledataid}}-HeaderForm" id="{{Grid.Tabledataid}}-HeaderForm">
<tr>
  {% for col in Grid.Columns %}
	<td>
    <a href="javascript:void(0)" onclick="Grid_HeaderClick({{Grid.Name}},'{{col.Name}}');">{{ col.Title }}</a>
    {% include Grid.Header.Filter.tpl  %}
  </td>
 {% endfor %}
 <td>
   <input type="button" onclick="Grid_Filter_DoFilter({{Grid.Name}});"></input>
 </td>
</tr>
  </form>
</thead>