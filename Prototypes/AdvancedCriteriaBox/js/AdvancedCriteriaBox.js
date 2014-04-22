define('advanced-criteria-box', ['require', 'exports', 'module', 'jquery', 'underscore', 'backbone'], function(require, exports, module) {
"use strict";

var $ = require('jquery');
var _ = require('underscore');
var EventEmitter = require('backbone').Events;

var AdvancedCriteriaBox = Object.create( EventEmitter );

AdvancedCriteriaBox.init = function(container, options) {
	this.entities = [];
	this.variables = options.variables;

	this.$container = $(container);
	this.$list = this.$container.find('.autocomplete > ul');
	this.$input = this.$container.find('li:last-child > input');

	this.state = {
		has_results: false,
		list_showing: false
	};
	this.hideAutocomplete();

	this._registerEvents();
};

AdvancedCriteriaBox.showAutocomplete = function() {
	this.$list.parent().show();
	this.state.list_showing = true;
};
AdvancedCriteriaBox.hideAutocomplete = function() {
	this.$list.parent().hide();
	this.state.list_showing = false;
};

AdvancedCriteriaBox._registerEvents = function() {
	this.$input.keydown(_.bind(this._keydown, this));
	this.$input.keypress(_.bind(this._keypress, this));
	this.$input.keyup(_.bind(this._keyup, this));

	this.$input.blur(_.bind(this.hideAutocomplete, this));

	this.$list.mousedown(_.bind(this._listSelected, this));
	this.$list.on('mouseenter', 'li', function(e) { $(e.target).addClass('active'); });
	this.$list.on('mouseleave', 'li', function(e) { $(e.target).removeClass('active'); });
};

AdvancedCriteriaBox._listSelected = function(e) {
	var text = this.$list.children('.active').first().text();
	this.$input.val(text);
	this.$input.focus();
	this.hideAutocomplete();

	e.preventDefault();
};

AdvancedCriteriaBox._lexer = function(text) {
	var symbols = /^[\+\*-,=><\(\)]+$/g;
	var numbers = /^-?[0-9]*\.?[0-9]+$/g;
	var displayTitles = _.pluck(this.variables, 'display');

	if (_.contains(displayTitles, text))
		return 'variable';
	else if (numbers.test(text))
		return 'number';
	else if (symbols.test(text))
		return 'operator';
};

AdvancedCriteriaBox._filterAutocomplete = function() {
	var text = this.$input.val().trim();
	var textRegex = new RegExp(text, 'gi');
	var displayTitles = [];

	if (!_.isEmpty(text))
		displayTitles = _.chain(_.pluck(this.variables, 'display'))
		 .filter(function(title) {
			 return title.search(textRegex) >= 0;
		 })
		 .sortBy(function(title) {
			 return title.search(textRegex);
		 })
		 .value();

	if (_.isEmpty(displayTitles)) {
		this.state.has_results = false;
		this.hideAutocomplete();
	}
	else {
		this.state.has_results = true;
		this.$list.html(
			displayTitles.map(function(title) {
				return "<li>" + title.replace(textRegex, '<span style="text-decoration: underline; font-weight: bold">$&</span>') + "</li>";
			}).join("\n")
		);
		this.showAutocomplete();
	}
};

AdvancedCriteriaBox._keyup = function(e) {
	var key = e.which || e.keyCode;

	switch (key) {
	case 13:
		this._listSelected(e);
		break;
	case 27:
		this.hideAutocomplete();
		break;
	case 37:
	case 38:
	case 39:
	case 40:
		break;
	default:
		this._filterAutocomplete();
	}
};

AdvancedCriteriaBox._keypress = function(e) {
	var key = e.which || e.keyCode || e.charCode;
};

AdvancedCriteriaBox._keydown = function(e) {
	var key = e.which || e.keyCode;

	console.log(key);

	switch (key) {
	case 8:
		var lastItem = this.$input.parent().prev();
		if (_.isEmpty(this.$input.val())) {
			this.$input.val(lastItem.text());
			lastItem.remove();

			e.preventDefault();
		}
		break;
	case 9:
		if (this.state.has_results)
			e.preventDefault();

		break;
	case 32:
		this._spaceBarDown(e);
		break;
	case 40: 			// Down
	case 38: 			// Up
		if (this.state.list_showing) {
			var firstItem, nextItem, activeItem;

			activeItem = this.$list.children('.active');
			if (key == 38) {
				firstItem = this.$list.children(':last');
				nextItem = activeItem.prev();
			} else if (key == 40) {
				firstItem = this.$list.children(':first');
				nextItem = activeItem.next();
			}

			if (activeItem.length)
			 	activeItem.removeClass('active');

			if (nextItem.length)
				nextItem.addClass('active');
			else
			 	firstItem.addClass('active');

			e.preventDefault();
		}
		break;
	}
};

AdvancedCriteriaBox._spaceBarDown = function(e) {
	var inputVal = this.$input.val().trim();
	var lexedClass = this._lexer(inputVal);

	if (lexedClass) {
		this.$input.val('');
		var newItem = $('<li/>', { class: lexedClass });
		newItem.insertBefore(this.$input.parent()).text(inputVal);

		e.preventDefault();
	}
};

$.fn.extend({
	AdvancedCriteriaBox: function(options) {
		var criteriaBox = Object.create( AdvancedCriteriaBox );
		criteriaBox.init(this, options);
	}
});

});