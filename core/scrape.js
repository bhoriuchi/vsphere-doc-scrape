/**
 * Document scraper/parser for vsphere documentation
 * 
 * @author Branden Horiuchi <bhoriuchi@gmail.com>
 * @license MIT
 * 
 */

var promise   = require('bluebird');
var fs        = promise.promisifyAll(require('fs'));
var _         = require('lodash');
var util      = require('./docUtil');

var _self     = this;
_self.schema  = {};
_self.types   = {};

var dev       = false;
var ver       = '6.0';
var base      = __dirname.replace('/core', '/docs/' + ver + '/ReferenceGuide/');
var allTypes  = base + 'index-all_types.html';
var rx        = /\"\$.\w+\(\)\"/g;


function ts() {
	return (new Date()).toISOString();
}

// run the code
util.getTypes(allTypes, _self).then(function() {
	
	var types = _.keys(_self.types);
	
	console.log(ts() + ' - Getting ' + types.length + ' Docs');
	
	var count = 0;
	return promise.each(types, function(type) {
		count++;
		if ((count % 100) === 0) {
			console.log(ts() + ' - ' + count + ' docs processed of ' + types.length);
		}
		
		return util.getDoc(_self.types[type], base, _self);
	});
})
.then(function() {
	
	// look through all dependencies for circular references and replace them
	_.forEach(_self.schema, function(scma, scmaName) {
		_.forEach(_.get(scma, '_deps.deps'), function(dep, depName) {
			
			// get dependency values
			var depDepVals = _.values(_.get(_self.schema[dep], '_deps.deps'));

			if (_.includes(depDepVals, scmaName)) {
				console.log('add circular to', scmaName);
				_self.schema[scmaName].properties[depName] = '$.Circular()';
			}
		});
	});
	
	
	console.log(ts() + ' - Writing Docs');
	
	var modFile = __dirname.replace('/core', '/docs/' + ver + '/index.js');

	
	var mod = '// vSphere Schema v' + ver + '\n' +
	'module.exports = function(env) {\n\n' +
	'\tvar _      = env.lodash;\n' +
	'\tvar merge  = env.merge;\n' +
	'\tvar $      = {};\n\n' +
	'\t$.Circular=function(){return "[Circular]";};\n';

	// create a new file
	return fs.writeFileAsync(modFile, mod, 'utf8').then(function() {
		return promise.each(_.keys(_self.schema), function(key) {
			
			_self.schema[key].inherits = _.get(_self.schema[key], '_deps.inherit');
			
			var objBody = JSON.stringify(
				_.omit(
					_self.schema[key], '_deps'
				)
			);
			
			var match = objBody.match(rx);
			
			_.forEach(match, function(m) {
				objBody = objBody.replace(m, _.trim(m, '"'));
			});
			
			var objStr;
			var inherit = _.get(_self.schema[key], '_deps.inherit');
			
			if (inherit) {
				objStr = '\t$.' + key + '=function(){return merge(' + objBody + ', $.' + inherit + '());};\n';
			}
			else {
				objStr = '\t$.' + key + '=function(){return ' + objBody + ';};\n';
			}

			return fs.appendFileAsync(modFile, objStr, 'utf8');
		});
	})
	.then(function() {
		
		var endStr = '\n' +
		'\treturn _.mapValues($, function(v, k) {\n' +
		'\t\treturn v();\n' + 
		'\t});\n' +
		'};';
		
		console.log(ts() + ' - Scrape complete');
		
		return fs.appendFileAsync(modFile, endStr, 'utf8');
	});
});

