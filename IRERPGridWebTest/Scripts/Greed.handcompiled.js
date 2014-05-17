(function (context, definition) {
    if (typeof define === "function" && define.amd)
        define(['jquery', 'underscore'], definition);
    else
        definition(context.jQuery, context._);

})(this, function ($, _) {

var EventEmitter = (function() {

  // Create local references to array methods we'll want to use later.
  var array = [];
  var push = array.push;
  var slice = array.slice;
  var splice = array.splice;

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  // Backbone.Events
  // ---------------

  // A module that can be mixed in to *any object* in order to provide it with
  // custom events. You may bind with `on` or remove with `off` callback
  // functions to an event; `trigger`-ing an event fires all callbacks in
  // succession.
  //
  //     var object = {};
  //     _.extend(object, Backbone.Events);
  //     object.on('expand', function(){ alert('expanded'); });
  //     object.trigger('expand');
  //
  var Events = {

    // Bind an event to a `callback` function. Passing `"all"` will bind
    // the callback to all events fired.
    on: function(name, callback, context) {
      if (!eventsApi(this, 'on', name, [callback, context]) || !callback) return this;
      this._events || (this._events = {});
      var events = this._events[name] || (this._events[name] = []);
      events.push({callback: callback, context: context, ctx: context || this});
      return this;
    },

    // Bind an event to only be triggered a single time. After the first time
    // the callback is invoked, it will be removed.
    once: function(name, callback, context) {
      if (!eventsApi(this, 'once', name, [callback, context]) || !callback) return this;
      var self = this;
      var once = _.once(function() {
        self.off(name, once);
        callback.apply(this, arguments);
      });
      once._callback = callback;
      return this.on(name, once, context);
    },

    // Remove one or many callbacks. If `context` is null, removes all
    // callbacks with that function. If `callback` is null, removes all
    // callbacks for the event. If `name` is null, removes all bound
    // callbacks for all events.
    off: function(name, callback, context) {
      var retain, ev, events, names, i, l, j, k;
      if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;
      if (!name && !callback && !context) {
        this._events = void 0;
        return this;
      }
      names = name ? [name] : Object.keys(this._events);
      for (i = 0, l = names.length; i < l; i++) {
        name = names[i];
        if (events = this._events[name]) {
          this._events[name] = retain = [];
          if (callback || context) {
            for (j = 0, k = events.length; j < k; j++) {
              ev = events[j];
              if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
                  (context && context !== ev.context)) {
                retain.push(ev);
              }
            }
          }
          if (!retain.length) delete this._events[name];
        }
      }

      return this;
    },

    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    trigger: function(name) {
      if (!this._events) return this;
      var args = slice.call(arguments, 1);
      if (!eventsApi(this, 'trigger', name, args)) return this;
      var events = this._events[name];
      var allEvents = this._events.all;
      if (events) triggerEvents(events, args);
      if (allEvents) triggerEvents(allEvents, arguments);
      return this;
    },

    // Tell this object to stop listening to either specific events ... or
    // to every object it's currently listening to.
    stopListening: function(obj, name, callback) {
      var listeningTo = this._listeningTo;
      if (!listeningTo) return this;
      var remove = !name && !callback;
      if (!callback && typeof name === 'object') callback = this;
      if (obj) (listeningTo = {})[obj._listenId] = obj;
      for (var id in listeningTo) {
        obj = listeningTo[id];
        obj.off(name, callback, this);
        if (remove || _.isEmpty(obj._events)) delete this._listeningTo[id];
      }
      return this;
    }

  };

  // Regular expression used to split event strings.
  var eventSplitter = /\s+/;

  // Implement fancy features of the Events API such as multiple event
  // names `"change blur"` and jQuery-style event maps `{change: action}`
  // in terms of the existing API.
  var eventsApi = function(obj, action, name, rest) {
    if (!name) return true;

    // Handle event maps.
    if (typeof name === 'object') {
      for (var key in name) {
        obj[action].apply(obj, [key, name[key]].concat(rest));
      }
      return false;
    }

    // Handle space separated event names.
    if (eventSplitter.test(name)) {
      var names = name.split(eventSplitter);
      for (var i = 0, l = names.length; i < l; i++) {
        obj[action].apply(obj, [names[i]].concat(rest));
      }
      return false;
    }

    return true;
  };

  // A difficult-to-believe, but optimized internal dispatch function for
  // triggering events. Tries to keep the usual cases speedy (most internal
  // Backbone events have 3 arguments).
  var triggerEvents = function(events, args) {
    var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
    switch (args.length) {
      case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
      case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
      case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
      case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
      default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args); return;
    }
  };

  var listenMethods = {listenTo: 'on', listenToOnce: 'once'};

  // Inversion-of-control versions of `on` and `once`. Tell *this* object to
  // listen to an event in another object ... keeping track of what it's
  // listening to.
  _.each(listenMethods, function(implementation, method) {
    Events[method] = function(obj, name, callback) {
      var listeningTo = this._listeningTo || (this._listeningTo = {});
      var id = obj._listenId || (obj._listenId = _.uniqueId('l'));
      listeningTo[id] = obj;
      if (!callback && typeof name === 'object') callback = this;
      obj[implementation](name, callback, this);
      return this;
    };
  });

  // Aliases for backwards compatibility.
  Events.bind   = Events.on;
  Events.unbind = Events.off;

  return Events;
})();

var GridToolbar = (function() {
    var GridToolbar = Object.create( EventEmitter );

    GridToolbar.init = function( el ) {
        this.$el = $(el);

        this.$el.on('click', 'button', onButtonClick.bind(this));
    };

    function onButtonClick(e) {
        this.trigger('click.' + $(e.target).data('name'));
    }

    return GridToolbar;
})();

var GridTable = (function() {
    var $tableContainer, $bodyContainer, $rowsContainer, $activeRow, trigger;

    var GridTable = Object.create( EventEmitter, {
        width: {
            get: function() { return $rowsContainer.width(); }
        },
        height: {
            get: function() { return $rowsContainer.height(); }
        },
        itemsInViewport: {
            get: itemsInViewport
        }
    });

    GridTable.init = function(tbody, totalPages) {
        $rowsContainer = this.el = $(tbody);
        $rowsContainer.prop('tabindex', '0');

        $tableContainer = $rowsContainer.parents('.table-container');
        $bodyContainer = $rowsContainer.parents('.body-container');

        $activeRow = null;

        $rowsContainer.on('mousedown', 'tr', rowMouseDown);
        $rowsContainer.keydown(keydown);
        $rowsContainer.keypress(keypress);
        $rowsContainer.keyup(keyup);

        $rowsContainer.on('mouseenter', 'tr', rowMouseEnter);

        trigger = this.trigger.bind(this);
    };

    GridTable.setContents = function(html) {
        $rowsContainer.html(html);
        $activeRow = null;
    };

    function itemsInViewport() {
        var rowHeight = $rowsContainer.children().first().height();
        var containerHeight = $bodyContainer.height();

        return Math.floor(containerHeight / rowHeight);
    }

    function rowMouseEnter(e) {
        trigger('rowHover', $(e.target).parent());
    }

    function rowMouseDown(e) {
        activateRow($(e.target).parents('tr'));
    }

    function keydown(e) {
        var key = (e.which || e.keyCode);

        switch(key) {
        case 33:
        case 34:
        case 35:
        case 36:
        case 38:
        case 40:
            keyboardNav(key);
            e.preventDefault();

            break;
        case 37:
        case 39:
            keyboardScroll(key);
            break;
        }
    };

    function keypress(e) {
        var key = e.which || e.keyCode;

        // console.log(key);
    }
    function keyup(e) {
        var key = e.which || e.keyCode;

        // console.log(key);
    }

    function keyboardScroll(key) {
        var scrollPosition = $tableContainer.scrollLeft(),
            scrollWidth = $tableContainer.get(0).scrollWidth;

        switch(key){
        case 37:
            if (scrollPosition > 0)
                $tableContainer.scrollLeft(scrollPosition - 20);
            break;
        case 39:
            if (scrollPosition < scrollWidth)
                $tableContainer.scrollLeft(scrollPosition + 20);
            break;
        }
    }

    function keyboardNav(key) {
        var $row, $rows = $rowsContainer.children();
        if ($rows.length == 0) return;

        var index = $rows.index($activeRow);

        if ($activeRow)
            switch(key) {
            case 33:
                $row = $($rows.get(Math.max(0, index - itemsInViewport())));
                break;
            case 34:
                $row = $($rows.get(Math.min(index + itemsInViewport(), $rows.length - 1)));
                break;
            case 35:
                $row = $rows.last();
                break;
            case 36:
                $row = $rows.first();
                break;
            case 37:
                break;
            case 38:
                $row = $activeRow.prev();
                break;
            case 39:
                //.scrollLeft()
            case 40:
                $row = $activeRow.next();
                break;
            }
        else
            switch(key) {
            case 33:
            case 35:
            case 38:
                $row = $rows.last();
                break;
            case 34:
            case 36:
            case 40:
                $row = $rows.first();
                break;
            }

        activateRow($row);
    }

    function scrollIntoView($row) {
        var container = $bodyContainer.get(0),
            row = $row.get(0);

        var docViewTop = container.scrollTop;
        var docViewBottom = docViewTop + container.offsetHeight;

        var elemTop = row.offsetTop;
        var elemBottom = elemTop + row.offsetHeight;

        if (elemTop < docViewTop)
            row.scrollIntoView(true);
        else if (elemBottom > docViewBottom)
            row.scrollIntoView(false);
    }

    function activateRow($row) {
        if ($row.length == 0) return;

        if ($activeRow)
            if ($activeRow.get(0) == $row.get(0))
                return;
            else
                $activeRow.removeClass('active');

        trigger('rowSelected', $row);

        $activeRow = $row;
        $activeRow.addClass('active');

        scrollIntoView($row);
    }

    return GridTable;

})();

var GridPager = (function() {
    var GridPager = Object.create( EventEmitter );
    GridPager.init = function(pager, totalPages) {
        this.$el = $(pager);

        this.reset(totalPages || 0);

        this.$el.on('click', 'button[rel]', navButtonsClick.bind(this));
    };
    GridPager.reset = function(totalPages, currentPage) {
        this.totalPages = totalPages;
        this.currentPage = currentPage || 0;

        // TODO: Put UI stuff (e.g. disabling nav buttons when appropriate) here.
        this.$el.find('.current-page').text(this.currentPage + 1); // + ' / ' + this.totalPages);
    };

    function navButtonsClick(e) {
        var rel = $(e.target).attr('rel');
        var page = 0;

        switch (rel) {
            case 'first': page = 0; break;
            case 'prev': page = Math.max(0, this.currentPage - 1); break;
            case 'next': page = Math.min(this.currentPage + 1, this.totalPages); break;
            case 'last': page = this.totalPages - 1; break;
        }
        this.trigger('requestPage', page);
    }

    return GridPager;
})();

var GridHeader = (function() {
    var GridHeader = Object.create( EventEmitter );

    var $headersContainer, filters = {}, trigger;

    GridHeader.init = function( header ) {
        $headersContainer = (this.$el = $(header)).find('.column-headers');

        $headersContainer.on('click', 'li > a.header', onHeaderClick);
        $headersContainer.on('click', 'li > a.header-menu', onHeaderMenuClick);

        $headersContainer.on('keyup', 'li.filter > input', onFilterKeyup);
        $headersContainer.on('keypress', 'li.filter > input', onFilterKeypress);

        trigger = this.trigger.bind(this);
    };

    GridHeader.resetSortOrders = function(sort) {
        $headersContainer.children().each(function(index, header) {
            var $header = $(header);
            var field = $header.data('name');
            var order = sort[field];

            if (order == null)
                $header.removeClass('asc desc');
            else
                $header.addClass(order);
        });
    };

    function onHeaderClick(e) {
        var col, $target = $(e.target);

        if ($(e.target).parent().hasClass('column-headers'))
            col = $target;
        else
            col = $target.parents('.column-headers > li');

        var colName = col.data('name'),
            colOrder = col.data('column-sort-order') || 0;

        var orderMap = [null, 'asc', 'desc'];
        var colOrderClass = orderMap[(colOrder + 1) % 3];

        col.data('column-sort-order', (colOrder + 1) % 3);
        col.prop('class', colOrderClass);

        trigger('order', colName, colOrderClass);
    }

    function onHeaderMenuClick(e) {
        var $header = $(e.target).parent();

        // TODO: This is temporary. Fix it.
        if ($header.hasClass('filter'))
            hideFilter($header);
        else
            showFilter($header);
    }

    function onFilterKeyup(e) {
        var key = e.which || e.keyCode;

        switch(key) {
        case 27:
            hideFilter($(e.target).parent());
            break;
        }
    }

    function onFilterKeypress(e) {
        var key = e.which || e.keyCode;

        switch(key) {
        case 13:
            onEnterFilter($(e.target).parent());
            break;
        }
    }

    function onEnterFilter($header) {
        var $textbox = $header.children('input');
        var $headerTitle = $header.children('a.header');

        var fieldName = $header.data('name');
        var filter = $textbox.val();

        if (filter != filters[fieldName]) {
            if (_.isEmpty(filter)) {
                delete filters[fieldName];
                $headerTitle.children('span').remove();
            } else {
                filters[fieldName] = filter;
                $headerTitle.children('span').remove();
                $headerTitle.append($('<span>' + filter + '</span>'));
            }

            trigger('filter', filters);
        }

        hideFilter($header);
    }

    function showFilter($header) {
        $header.addClass('filter');
        $header.children('input').focus();
    }
    function hideFilter($header) {
        var $textbox = $header.children('input');
        var fieldName = $header.data('name');

        $textbox.val(filters[fieldName]);

        $header.removeClass('filter');
    }

    return GridHeader;
})();

var Grid = (function() {
    var $container, $tableContainer, $bodyContainer;
    var toolbar, header, body, pager, ds;

    var Grid = Object.create( EventEmitter );

    Grid.init = function(container, options) {
        options = normalizeOptions(options);

        $container = this.$el = $(container);
        $tableContainer = $container.children('.table-container');
        $bodyContainer = $tableContainer.find('.body-container');

        mouseWheelSupport();

        toolbar = Object.create( GridToolbar );
        toolbar.init($container.children('[role=toolbar]'));
        toolbar.on('click.format', showFormatModal);

        header = Object.create( GridHeader );
        header.init($tableContainer.find('.header-container'));

        body = Object.create( GridTable );
        body.init($bodyContainer.find('table[role=grid] > tbody'));

        pager = Object.create( GridPager );
        pager.init($container.children('[role=navigation]'), options.totalPages);

        body.on('rowHover', customPager);

        if (options.dataSource) {
            ds = options.dataSource;

            if (header) {
                header.on('order', onHeaderSort);
                header.on('filter', onHeaderFilter);
            }

            if (pager)
                pager.on('requestPage', onRequestPage);
        }
    }
    Grid.refresh = refresh;

    function normalizeOptions(options) {
        options = options || {};

        if (_.has(options, 'DataColumns')) {
            options.columns = _.indexBy(options.DataColumns, 'Name');
            delete options.DataColumns;
        }

        if (_.has(options, 'Columns')) {
            if (_.isEmpty(options.columns))
                options.columns = _.indexBy(options.Columns, 'Name');

            options.Columns.forEach(function(col) {
                options.columns[col.Name].visible = true;
            });

            delete options.Columns;
        }

        return options;
    }

    function mouseWheelSupport() {
        $tableContainer.mousewheel(function(e) {
            var scrollPosition = $tableContainer.scrollLeft();
            if ((scrollPosition > 0 && e.deltaX * e.deltaFactor < 0) ||
                (scrollPosition < $tableContainer.get(0).scrollWidth && e.deltaX * e.deltaFactor > 0)) {

                $tableContainer.scrollLeft(scrollPosition + e.deltaX * e.deltaFactor);
                e.preventDefault();
            }
        });

        $bodyContainer.mousewheel(function(e) {
            var scrollPosition = $bodyContainer.scrollTop();
            if ((scrollPosition > 0 && e.deltaY * e.deltaFactor > 0) ||
                (scrollPosition < $bodyContainer.get(0).scrollHeight && e.deltaY * e.deltaFactor < 0)) {

                $bodyContainer.scrollTop(scrollPosition - e.deltaY * e.deltaFactor);
                e.preventDefault();
            }
        });
    }

    function showLoading() {
        $container.addClass('loading');
    }
    function hideLoading() {
        $container.removeClass('loading');
    }

    function refresh() {
        showLoading();

        return ds.refresh()
            .then(resetGridUI)
            .fail(function(e) {
                setTimeout(function() {
                    hideLoading();
                }, 2000);
                throw e;
            })
            .done();
    }

    function onHeaderSort(columnName, order) {
        ds.sortBy(columnName, order);
        refresh();
    }

    function onHeaderFilter(filters) {
        ds.filter = filters;
        refresh();
    }

    function onRequestPage(page) {
        ds.page = page;
        refresh();
    }

    // Refresh UI, based on the final DataSource state
    function resetGridUI(result) {
        hideLoading();

        body.setContents(result.html);

        pager.reset(result.state.totalPages, result.state.currentPage);
        header.resetSortOrders(result.state.sort);
    }

    function customPager($row) {
        if ($tableContainer.offset().top + $tableContainer.height() - $row.offset().top < 2 * $row.height() ||
            $row.next().length == 0)
            pager.$el.fadeIn(100);
        else
            pager.$el.fadeOut(100);
    }

    function showFormatModal() {
        //$('#myModal').modal('show');
    }

    return Grid;
})();

$.fn.extend({
    greed: function(options) {
        var grid = Object.create( Grid );
        grid.init(this, options);

        grid.$el.data('greed', grid);

        return grid;
    }
});

});