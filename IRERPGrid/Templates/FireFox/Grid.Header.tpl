<thead>
	<tr rel='filter'>
	{% for col in Grid.Columns %}
		{% include Grid.Header.Filter.tpl %}
	{% endfor %}
	</tr>
	<tr>
	{% for col in Grid.Columns %}
		<th data-column-name='{{col.Name}}'>
			{{col.Title}}
  		</th>
 	{% endfor %}
	</tr>
</thead>