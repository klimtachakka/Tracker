(function() {


	require(['../tracker/Tracker.js', '../tracker/plugins/Redirecter'], function(Tracker, Redirecter) {

		var t = new Tracker({
			plugins: [Redirecter],
			timeStamp: false
		});

		window.tracker.log('logg... (static access)', 'handles', 'multiple', {
			arg: {
				that: 0
			}
		});
		window.tracker.warn('warn...(static access)');

		window.tracker.out('warn', '(dynamic access, single argument only)');
		window.tracker.out('log', '(dynamic access, single argument only)');

		var times = 0;

		var key1 = setInterval(function() {
			window.tracker.fixed('f', 'fixed positioned log:', Math.random());

		}, 100);

		window.tracker.start('TIMER_KEY');

		var key2 = setInterval(function() {
			window.tracker.log('rolling log:', Math.random());

			times++;
			if (times > 2) {
				clearInterval(key1);
				clearInterval(key2);
				window.tracker.end('TIMER_KEY');
			}
		}, 800);


		setTimeout(function() {
			throw 'forced runtime error';
		}, 2000);


	});

})();