<div id="{{Grid.Divcontainerid}}">
Grid Template For Grid {{Grid.Name}}
<br/>
<table id ="{{Grid.Tabledataid}}" data-GridName="{{Grid.Tabledataid}}">
{% include Grid.Header.tpl %}

 <tbody>
{% for row in GridData %}
<tr>
	{%for col in Grid.Columns %}
		<td>{% GGRCV row col %}</td>
	{%endfor%}
</tr>
{% endfor %}
</tbody>
  
{% comment %}Pager Section{% endcomment %}
{% include FullHtmlRender/Grid.Pager.tpl %}

</table>
</div>