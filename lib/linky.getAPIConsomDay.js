var queries = require('./linky.queries.js');
var Promise = require('bluebird');
var linky = require('@bokub/linky');
var shared = require('./linky.shared.js');
var getAPIConsomMonth = require('./linky.getAPIConsomMonth.js');


module.exports = function getAPIConsomDay(params){
	sails.log.debug(`Linky : getAPIConsomDay`);
	shared.success = false;
	   
try {		   
// Log in
	return linky.login(shared.clientId, shared.clientSecret)
	.then((session) => {

		return session.getDailyData()
		.then((result) => {
			shared.data_day = result;
			return result;
		})
		.then((result) => {
			shared.daily = result[result.length-1];
			return shared.daily;
		})
		.then((result) => {
			shared.success = true;
			
			return gladys.utils.sql(queries.getLinkyDeviceTypeDay,[])
			.then((DevicesTypeSelect) => {
				
				return Promise.map(shared.data_day, function(data, index) {

					return gladys.deviceState.create({devicetype: DevicesTypeSelect[0].id, value: data.value || 0, datetime: data.date})
					.then(status => {
						// Device updated with success
						return true;
					}) 
					.catch(function(err){
						// something bad happened 
						return false;
					});
				})
				.then((status) => {
					//Device updated with success
					return getAPIConsomMonth();
				})
				.catch(function(err){
					// something bad happened 
					console.log('linky',error);
					return false;
				});
			});
		});

	});

}
catch(error) {
	shared.success = false;
	console.log('linky',error);
	return false;
};
	   
};