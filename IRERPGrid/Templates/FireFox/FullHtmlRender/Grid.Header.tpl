<header class='header-container'>
    <ul class='column-headers'>
	{% for col in Grid.Columns %}
		<li data-name='{{col.Name}}' style='width: {{col.Width}}'>
            <a class='header'>{{col.Title}}</a>
            <input type='text' placeholder='{{col.Title}}' />
            <a class='header-menu'></a>
        </li>
	{% endfor %}
	</ul>
</header>
