<!-- Formatter modal -->
<div class="modal fade grid-format-box" id='myModal'>
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
				<h4 class="modal-title">Modal title</h4>
			</div>
			<div class="modal-body">
				<ul class='criteria-list'>
					<script type='text/html'>
						<li>
							<a rel='remove' class='fa fa-minus-circle'></a>

							<input type='text' name='criteria' />

							<input type='color' name='foreground' value='#000000' />
							<input type='color' name='background' value='#ffffff' />

							<div class="btn-group" data-toggle="buttons">
								<label class="btn btn-default">
									<input type="checkbox" name='bold'><i class='fa fa-bold'></i>
								</label>
								<label class="btn btn-default">
									<input type="checkbox" name='italic'><i class='fa fa-italic'></i>
								</label>
								<label class="btn btn-default">
									<input type="checkbox" name='underline'><i class='fa fa-underline'></i>
								</label>
							</div>
						</li>
					</script>
				</ul>
			</div>
			<div class="modal-footer">
				<button rel='add' class='btn btn-default fa fa-plus pull-left'></button>
				<button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
				<button type="submit" class="btn btn-primary">Apply</button>
			</div>
		</div><!-- /.modal-content -->
	</div><!-- /.modal-dialog -->
</div><!-- /.modal -->
<div role='toolbar'>
	<button data-name='format' data-toggle="modal" data-target="#myModal">Format</button>
</div>
