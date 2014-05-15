define([], function() {
	function Consola(options) {

		this.___argsCache = [];
		this.___argsCacheId = 0;
		this.___lastInput = '';
		this.___Handlebars = options.Handlebars;

		//this.___refresh = options.refresh;
		//this.___manipulateEvents = options.manipulateEvents;


	}

	Consola.prototype.ID = 'csla';



	Consola.prototype.___consoleKeyUpHandler = function(e) {


		this.___consoleManager(e.target.value, e.keyCode, e.target);
	};
	Consola.prototype.___consoleManager = function(value, keyCode, target) {



		this.___lastInput = value;

		var params = [];

		if (value.indexOf('(') > -1) {
			var chains = value.split('(');
			value = chains[0];
			var command = chains[1];
			var commands = [];
			if (command.indexOf(')') > -1) {
				commands = command.split(')')[0];
				params = commands.split(' ').join('').split(',');
			}

			window.tracker.outFixed('[PARAM]', params);
		}

		var values = value.split('.');

		value = value.toLowerCase();

		var lowerValues = value.split('.');



		var len = values.length;


		var cd = window;
		var keyChain = [];


		var shortCut = false;
		if (keyCode === 32) {
			shortCut = true;
			//e.preventDefault();
		}

		var keys = [];
		for (var i = 0; i < len; i++) {
			var printed = false;
			for (var key in cd) {
				var lowerCurrValue = lowerValues[i];
				var currValue = values[i];

				var result = key.toLowerCase().indexOf(lowerCurrValue);

				if (i >= len - 1 && (!lowerCurrValue || result > -1)) {

					keys.push(key);
				}


				if (result === 0) {
					if (!printed) {
						window.tracker.outFixed('[SPACE] >', key);
						printed = true;
					}
					//window.tracker.outFixed(i, key + ':' + currValue);

					if (shortCut && i === len - 1) {
						currValue = key;

					}


					if (cd[currValue]) {
						cd = cd[currValue];

						keyChain.push(currValue);

						window.tracker.outFixed('[ENTER] > ', keyChain.join('.'));
					}

					if (shortCut && i === len - 1) {
						target.value = keyChain.join('.') + '.';
						this.___consoleManager(target.value, null, target);

						return;
					}


				}



			}
		}

		window.tracker.outFixed('[ITEMS]', '[' + keys.join('][') + ']');



		if (keyCode === 13) {
			this.___argsCache.push(this.___lastInput);
			this.___argsCacheIndex = this.___argsCache.length - 1;
			this.runCommand(keyChain, cd, params);
			//return e.preventDefault();
		}


	};

	Consola.prototype.runCommand = function(keyChain, cd, params) {
		if (params.length > 0) {

			window.tracker.out('>', keyChain.join('.') + '(' + params.join(',') + ');', true);

			window.tracker.out('>', cd.apply(this, params, true));
		} else {

			window.tracker.out('>', keyChain.join('.'), true);

			if (!cd.length) {
				for (var key in cd) {
					window.tracker.outObj(cd);
					key = null;
					return;

				}
			}
			window.tracker.out('>', cd, true);
		}


	};

	Consola.prototype.___consoleKeyDownHandler = function(e) {

		if (e.keyCode === 13 || e.keyCode === 32) {

			e.preventDefault();
		}
		if (e.keyCode === 38) {
			//up
			if (this.___argsCacheIndex > 0) {
				this.___argsCacheIndex--;
			}
			e.target.value = this.___argsCache[this.___argsCacheIndex];
			e.preventDefault();
		}
		if (e.keyCode === 40) {
			//down

			if (this.___argsCacheIndex < this.___argsCache.length - 1) {
				this.___argsCacheIndex++;
			}
			e.target.value = this.___argsCache[this.___argsCacheIndex];
			e.preventDefault();
		}
	};


	Consola.prototype.___toggleConsole = function() {

		this.enabled = !this.enabled;

		this.___refresh();

	};

	Consola.prototype.events = [{
		id: 'plugin-csla-input',
		handler: '___consoleKeyDownHandler',
		event: 'keydown'
	}, {
		id: 'plugin-csla-input',
		handler: '___consoleKeyUpHandler',
		event: 'keyup'
	}];

	Consola.prototype.refresh = function() {

		if (this.enabled) {
			this.___render();
			var el = window.document.getElementById('tracker-plugin-' + this.ID + '-input');
			el.value = this.___lastInput;
			el.focus();

		}
	};


	Consola.prototype.___render = function() {
		var templateFunc = this.___Handlebars.compile(this.___template);
		var html = templateFunc({
			id: this.ID
		});
		var target = window.document.getElementById('tracker-plugin-' + this.ID);
		target.innerHTML = html;
	};

	Consola.prototype.___template = '<div><form action=""><input style="width:90%; background:rgba(0,0,0,0); border:none; font-family:monospace; color:lawngreen;" autocomplete="off" type="text" id="tracker-plugin-{{id}}-input"></form></div>';

	return Consola;


});