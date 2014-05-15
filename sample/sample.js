(function() {


	require(['../tracker/Tracker.js', '../tracker/plugins/Redirecter'], function(Tracker, Redirecter) {

		var t = new Tracker({
			plugins: [Redirecter]
		});

		window.tracker.log('logg... (static access)', 'handles', 'multiple', {
			arg: {
				that: 0
			}
		});
		window.tracker.warn('warn...(static access)');

		window.tracker.out('warn', '(dynamic access, single argument only)');
		window.tracker.out('log', '(dynamic access, single argument only)');


		setInterval(function() {
			window.tracker.fixed('f', 'fixed positioned log:', Math.random());
		}, 100);

		setInterval(function() {
			window.tracker.log('rolling log:', Math.random());
		}, 800);



	});

})();