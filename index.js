const path = require('path'),
	fs = require('fs')

module.exports = function DebugLogger(dispatch) {
	let file = path.join(__dirname, '..', '..', 'tera-proxy-' + Date.now() + '.log')

	dispatch.hook('*', 'raw', { order: 999999, filter: { fake: null, silenced: null, modified: null} }, (code, data, fromServer, fake) => {
		let today = new Date();
	fs.appendFile(file, "[" + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds() + ":" + today.getMilliseconds() + "]	" + (fromServer ? '<-' : '->') + '	' + (fake ? '[CRAFTED]	' : '') + (data.$silenced ? '[BLOCKED]	' : '') + (data.$modified ? '[EDITED]	' : '') + ( (!fake && !data.$silenced && !data.$modified) ? '         	' : '') + (dispatch.base.protocolMap.code.get(code) || code) + '	' + data.toString('hex') + '\n', (function(){}))
	})
}