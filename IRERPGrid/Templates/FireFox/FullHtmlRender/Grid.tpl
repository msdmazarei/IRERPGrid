<div data-grid-name='{{Grid.Name}}' role='application' class='grid-container'>
	  {% include FullHtmlRender/Grid.LoadingOverlay.tpl %}
	  {% include FullHtmlRender/Grid.Toolbar.tpl %}

    <!-- Gholi -->
    <div class='table-container'>
        <div class='grid-width' style='width: {{Grid.Width}}'>
            {% include FullHtmlRender/Grid.Header.tpl with Grid %}
			      {% include FullHtmlRender/Grid.Body.tpl widh Grid %}
		    </div>
    </div>
	  {% include FullHtmlRender/Grid.Pager.tpl with Grid %}
</div>
