<thead>
	<tr>
	{% for col in Grid.Columns %}
		<th data-column-name='{{col.Name}}'>
			{{col.Title}}
    		{% include Grid.Header.Filter.tpl %}
  		</th>
 	{% endfor %}
	</tr>
</thead>