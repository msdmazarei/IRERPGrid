<div id="{{Grid.Divcontainerid}}" data-grid-name="{{Grid.Name}}" role='application'>
	<div role='toolbar'></div>

	<table id="{{Grid.Tabledataid}}" role='grid'>
		<caption>Grid Template For Grid {{Grid.Name}}</caption>

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
	</table>

	{% comment %}Pager Section{% endcomment %}
	{% include FullHtmlRender/Grid.Pager.tpl with Grid %}
</div>