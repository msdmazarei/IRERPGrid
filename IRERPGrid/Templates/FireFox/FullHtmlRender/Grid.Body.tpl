<section class='body-container'>
    <table role='grid' class='grid-body'>
        <colgroup>
        {% for col in Grid.Columns %}
            <col data-name='{{col.Name}}' style='width: {{col.Width}}' />
        {% endfor %}
        </colgroup>
        <thead>
            <tr class='column-headers'>
            {% for col in Grid.Columns %}
                <th>{{col.Title}}</th>
            {% endfor %}
            </tr>
        </thead>
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
</section>