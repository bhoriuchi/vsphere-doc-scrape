var schema = require('../docs/4.0');
var _ = require('lodash');

var env = {
	lodash: _,
	// function to merge objects
	merge: function (obj, source) {
		_.assign(obj.properties, source.properties);
		_.assign(obj.methods, source.methods);
		return obj;
	}
};

console.log(JSON.stringify(schema(env).LocalizedMethodFault, null, '  '));