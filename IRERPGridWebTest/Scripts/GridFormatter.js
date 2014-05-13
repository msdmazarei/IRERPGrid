define(function(require, exports, module) {
"use strict";

var $ = require('jquery');
var _ = require('underscore');

var EventEmitter = require('IRERP/lib/backbone-events');


function appendNewItem($criteriaList) {
	var newItem = $($criteriaList.children('script').first().html());
	$criteriaList.append(newItem);
}
function removeItem(e) {
	$(e.target).parents('.criteria-list > li').remove();
}

function fillItem($li, item) {
	$li.find('input').each(function(index, el) {
		el[el.type == 'checkbox' ? 'checked' : 'value'] = item[el.name];
	});
}
function readItem($li) {
	var item = {};

	$li.find('input').each(function(index, el) {
		item[el.name] = el[el.type == 'checkbox' ? 'checked' : 'value'];
	});

	return item;
}

function applyFormat() {
	this.trigger('submit');
	console.log(this.items);
}

var GridFormatter = Object.create( EventEmitter, {
	items: {
		get: function() {
			return this.$el.find('.criteria-list > li').map(function() {
				return readItem($(this));
			}).toArray();
		}
	}
});

GridFormatter.init = function(el) {
	this.$el = $(el);
	var $criteriaList = this.$el.find('.criteria-list');

	this.$el.find('button[rel=add]').click(appendNewItem.bind(this, $criteriaList));
	this.$el.find('button[type=submit]').click(applyFormat.bind(this));
	$criteriaList.on('click', '[rel=remove]', removeItem.bind(this));
};

return GridFormatter;
});