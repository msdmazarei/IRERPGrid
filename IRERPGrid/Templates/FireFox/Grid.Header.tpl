<thead>
	<tr class='column-filters' rel='filter'>
	{% for col in Grid.Columns %}
		<th>
			{% include Grid.Header.Filter.tpl %}
		</th>
	{% endfor %}
	</tr>
	<tr class='column-headers'>
	{% for col in Grid.Columns %}
		<th data-column-name='{{col.Name}}'>
			{{col.Title}}
  		</th>
 	{% endfor %}
	</tr>
</thead>