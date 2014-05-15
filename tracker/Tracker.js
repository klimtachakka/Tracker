define([], function() {
	function Tracker(options) {


		this.___Handlebars = options.Handlebars;

		if (!this.___Handlebars) {



			throw ('Handlebars is required.');
		}



		this.___eventHandlerHash = {};
		this.___fixedHash = {};
		this.___fixed = [];
		this.___rolling = [];
		this.___miniMized = options.minimized === true;
		this.___maxRolling = options.maxRolling || 12;
		this.___paused = false;
		this.___oldData = {};
		this.___showFilters = true;
		this.___alpha = options.alpha || 0.8;
		this.___plugins = this.___addPlugins(options.plugins);
		this.___timeStamp = (options.timeStamp === false) ? false : true;

		this.___filter = options.filter || {
			log: true,
			warn: true,
			error: true,
			fixed: true
		};
		this.___colorMap = options.colorMap || {
			fixed: 'cyan',
			log: 'white',
			warn: 'yellow',
			error: 'red'
		};

		this.___logs = options.logs || this.___filter;



		this.___target = options.target || this.___createTarget();
		this.___refresh();

		window.tracker = {
			out: this.___bind(this.out),
			outObj: this.___bind(this.outObj),
			outFixed: this.___bind(this.outFixed),
			filter: this.___filter
		};


		this.___addLogs(this.___logs);


	}



	Tracker.prototype.___addLogs = function(logs) {
		var that = this;
		for (var log in logs) {



			window.tracker[log] = function(log) {
				return that.___bind(function() {
					var logkey = log;
					var arr = [];
					for (var key in arguments) {
						var item = arguments[key];
						if (window.JSON && window.JSON.stringify) {
							item = window.JSON.stringify(item);
						}
						arr.push(item);
					}


					this.out(logkey, arr.join(','));
				});
			}(log);



		}
	};


	Tracker.prototype.___addPlugins = function(plugins) {
		if (!plugins) {
			return [];
		}

		var ret = [];
		var len = plugins.length;
		for (var i = 0; i < len; i++) {
			var reference = plugins[i];

			var instance = new reference({
				Handlebars: this.___Handlebars,
				tracker: this
			});

			if (instance.ENABLED_BY_DEFAULT) {
				instance.enabled = true;
			}

			var pluginObj = {
				id: instance.ID,
				instance: instance
			};

			ret.push(pluginObj);
		}

		return ret;
	};



	Tracker.prototype.___refresh = function() {

		this.___innerTarget = this.___renderShell();
		if (!this.___miniMized) {
			this.___render();

		}
	};

	Tracker.prototype.___pluginClickHandler = function(e) {
		var id = e.target.id.split('tracker-')[1];

		var len = this.___plugins.length;
		for (var i = 0; i < len; i++) {
			var pluginObj = this.___plugins[i];
			if (pluginObj.id === id) {
				pluginObj.instance.enabled = !pluginObj.instance.enabled;
				break;
			}
		}
		this.___refresh();
	};

	Tracker.prototype.___showFiltersHandler = function() {
		this.___showFilters = !this.___showFilters;
		this.___refresh();
	};

	Tracker.prototype.___minimizeHandler = function() {
		this.___miniMized = !this.___miniMized;
		this.___refresh();
	};
	Tracker.prototype.___toggleFilterHandler = function(event) {
		var key = event.target.id.split('-')[1];
		this.___filter[key] = !this.___filter[key];
		this.___refresh();
	};
	Tracker.prototype.___clearHandler = function() {
		this.___fixed = [];
		this.___fixedHash = {};
		this.___rolling = [];
		this.___refresh();
	};
	Tracker.prototype.___pauseHandler = function() {
		this.___paused = !this.___paused;
		this.___refresh();
	};
	Tracker.prototype.___helpHandler = function() {
		var maxRolling = this.___maxRolling;

		this.___paused = false;

		var helpers = [{
			'<': 'minimize tracking (still collecting tracks)'
		}, {
			'>': 'maximize tracking (only available after minimize)'
		}, {
			'F': 'toggle show filter toggling'
		}, {
			'?': 'help'
		}, {
			'P': 'pause tracking'
		}, {
			'X': 'clear tracking'
		}, {
			'options': '___________________________________________________'
		}, {
			'maxRolling': 'maximum fields displayed from tracker.out()'
		}, {
			'filter': '{log:true, error:true, customValue:true}'
		}, {
			'colorMap': '{log:blue,error:red, customValue:green}'
		}, {
			'Handlebars': 'instance of Handlebars (required)'
		}, {
			'alpha': 'float 0 - 1 (background)'
		}, {
			'usage': '_____________________________________________________'
		}, {
			'out': 'tracker.out(FILTER_LEVEL, ARG)'
		}, {
			'outFixed': 'tracker.outFixed(KEY, ARG)'
		}, {
			'outObj': 'tracker.outObj({key1:value1},RECURSIVE)'
		}, {
			'filter states': '_____________________________________________'
		}];

		for (var key in this.___filter) {
			var obj = {};
			obj[key] = 'enable/disable current filter';
			helpers.push(obj);
		}

		this.___maxRolling = helpers.length;

		this.___refresh();

		for (var i = 0; i < this.___maxRolling; i++) {
			var helpItem = helpers[i];
			for (var hKey in helpItem) {
				this.out(hKey, helpItem[hKey], true);
			}
		}


		this.___maxRolling = maxRolling;
	};

	Tracker.prototype.___bind = function(func, scope) {
		var that = scope || this;
		return function() {
			func.apply(that, arguments);
		};
	};

	Tracker.prototype.___addEvent = function(event, target, handler) {
		if (target.addEventListener) {
			target.addEventListener(event, handler);
		} else if (target.attachEvent) {
			target.attachEvent(event, handler);
		}
	};

	Tracker.prototype.out = function(key, value, force) {


		if ((this.___filter[key] || force) && !this.___paused) {
			this.___rolling.push(this.___makeLogItem(this.___colorMap[key], key, value + ''));

			if (this.___rolling.length > this.___maxRolling) {
				this.___rolling.shift();
			}

			if (!this.___miniMized) {
				this.___render();
			}
		}

	};
	Tracker.prototype.outFixed = function(key, value) {
		if (!this.___paused && this.___filter.fixed) {
			this.___fixedHash[key] = this.___makeLogItem('cyan', key, value + '');
			if (!this.___miniMized) {
				this.___render();
			}
		}
	};
	Tracker.prototype.outObj = function(obj) {
		for (var key in obj) {
			this.out(key, obj[key], true);
		}
	};

	Tracker.prototype.___makeLogItem = function(color, key, value) {

		if (this.___timeStamp) {
			value = '[' + new Date().getMilliseconds() + '] ' + value;
		}

		return {
			color: color,
			key: key,
			value: value
		};

	};



	Tracker.prototype.___createTarget = function() {
		var defualtTarget = window.document.getElementById('tracker');
		if (defualtTarget) {
			return defualtTarget;
		}

		var container = window.document.createElement('div');
		container.id = 'Tracker';
		container.style.position = 'fixed';
		container.style['z-index'] = 90000000;

		window.document.body.appendChild(container);

		return container;
	};


	Tracker.prototype.___render = function() {

		var fixed = [];

		for (var key in this.___fixedHash) {
			fixed.push(this.___fixedHash[key]);
		}

		var rolling = this.___rolling;



		var data = {
			fixed: fixed,
			rolling: rolling
		};


		this.___innerTarget.innerHTML = this.___renderHTML(this.___template, data);
	};
	Tracker.prototype.___renderShell = function() {

		var data = {

		};
		var items = [];

		items.push({
			title: this.___miniMized ? '>' : '<',
			id: 'move',
			color: this.___miniMized ? 'white' : 'gray',
			handler: '___minimizeHandler',
			event: 'click'
		});
		if (!this.___miniMized) {
			items.push({
					title: 'F',
					id: 'filters',
					color: this.___showFilters ? 'white' : 'gray',
					handler: '___showFiltersHandler',
					event: 'click'
				}, {
					title: '?',
					id: 'help',
					color: 'white',
					handler: '___helpHandler',
					event: 'click'
				}, {
					title: 'P',
					id: 'pause',
					color: this.___paused ? 'white' : 'gray',
					handler: '___pauseHandler',
					event: 'click'
				}, {
					title: 'X',
					id: 'clear',
					color: 'white',
					handler: '___clearHandler',
					event: 'click'
				}
				/*, {
				title: 'CON',
				id: 'con',
				color: this.___consoleMode ? 'white' : 'gray',
				handler: '___toggleConsole',
				event: 'click'
			}*/
			);

			var len = this.___plugins.length;
			for (var i = 0; i < len; i++) {
				var pluginObj = this.___plugins[i];
				items.push({
					color: pluginObj.instance.enabled ? 'white' : 'gray',
					id: pluginObj.id,
					title: pluginObj.id,
					handler: '___pluginClickHandler',
					event: 'click'
				});

				this.___manipulateEvents(pluginObj.instance, pluginObj.events, false);

			}

			if (this.___showFilters) {

				for (var key in this.___filter) {
					items.push({
						title: key,
						color: this.___filter[key] ? this.___colorMap[key] : 'gray',
						id: key,
						handler: '___toggleFilterHandler',
						event: 'click'
					});
				}
			}
		}
		this.___manipulateEvents(this, this.___oldData.items, false);
		data.alpha = this.___alpha;
		data.items = items;
		data.plugins = this.___plugins;
		this.___target.innerHTML = this.___renderHTML(this.___templateShell, data);

		this.___manipulateEvents(this, items, true);

		this.___oldData = data;

		var lenp = this.___plugins.length;
		for (var j = 0; j < lenp; j++) {
			var pObj = this.___plugins[j];
			pObj.instance.refresh();
			if (pObj.instance.enabled) {
				this.___manipulateEvents(pObj.instance, pObj.instance.events, true);
			}
		}


		return window.document.getElementById('tracker-content');


	};

	Tracker.prototype.___manipulateEvents = function(scope, data, add) {

		for (var key in data) {
			var item = data[key];
			var handler = this.___bind(scope[item.handler], scope);
			this.___eventHandlerHash[item.id + item.event] = handler;
			var target = window.document.getElementById('tracker-' + item.id);



			if (add) {
				if (target.addEventListener) {
					target.addEventListener(item.event, handler);
				} else if (target.attachEvent) {
					target.attachEvent(item.event, handler);
				}
			} else if (target) {
				if (target.removeEventListener) {
					target.removeEventListener(item.event, this.___eventHandlerHash[item.id + item.event]);
				} else if (target.detachEvent) {
					target.detachEvent(item.event, this.___eventHandlerHash[item.id + item.event]);
				}
			}
		}
	};



	Tracker.prototype.___renderHTML = function(template, data) {
		var templateFunc = this.___Handlebars.compile(template);
		var html = templateFunc(data);
		html = html.split('\n').join('<br>');
		html = html.split('_space').join('&nbsp;');
		return html;
	};


	//Tracker.prototype.___templateShell = '<div style="background:rgba(0,0,0,0.8);padding:2px; font-size:8px;">{{#if menu}}<div style="color:white;font:bold; min-width:160px;"><p id="tracker-move" style="float:left;"> [<>]&nbsp;</p><p id="tracker-play" style="float:left;">&nbsp;[>]&nbsp;</p><p id="tracker-pause">&nbsp;[||]</p></div>{{/if}}<div id="tracker-content"></div></div>';
	Tracker.prototype.___templateShell = '<div style="margin:1px; font-family:monospace; background:rgba(0,0,0,{{alpha}});padding:2px; font-size:12px; color:white;"><div>{{#items}}<p id="tracker-{{id}}" style="font-family:monospace;float:left; color:{{color}}; cursor:pointer; -webkit-margin-before:0px;-webkit-margin-after:0px;"> [{{title}}]</p>{{/items}}</div>{{#plugins}}<div style="clear:both;" id="tracker-plugin-{{id}}"></div>{{/plugins}}<div style="clear:both;" id="tracker-content"></div></div>';

	Tracker.prototype.___template = '<div>{{#fixed}}<p style="font-family:monospace;margin:1px; color:{{color}};">{{key}} : {{value}}</p>{{/fixed}}</div><div">{{#rolling}}<p style="margin:1px;color:{{color}};">{{key}} : {{value}}</p>{{/rolling}}</div>';


	return Tracker;
});