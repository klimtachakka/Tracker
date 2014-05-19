(function() {

	window.tracker.setup({

		timeStamp: false,
		alpha: '0.9',
		fps: 50,
		namespace: 't2',
		fpsExtended: true,
		logs: {
			log: true,
			green: true,
			warn: true,
			fixed: true,
			error: true,
			pink: true
		},
		filter: {
			log: true,
			green: true,
			warn: true,
			error: true,
			fixed: true,
			pink: true
		},
		colorMap: {
			fixed: 'cyan',
			log: 'white',
			warn: 'yellow',
			error: 'red',
			green: '#ADFF2F',
			pink: '#FF69B4'
		}
	});

})();