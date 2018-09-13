const path = require('path'),
	fs = require('fs')

module.exports = function DebugLogger(dispatch) {
	let file = path.join(__dirname, '..', '..', 'tera-proxy-' + Date.now() + '.log')

	dispatch.hook('*', 'raw', { order: 999999, filter: { fake: null, silenced: null, modified: null} }, (code, data, fromServer, fake) => {
		let today = new Date();
	fs.appendFileSync(file, "[" + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds() + ":" + today.getMilliseconds() + "]	" + (fromServer ? '<-' : '->') + '	' + (fake ? '[FAKE] ' : '       ') + (data.$silenced ? '[BLOCKED] ' : '') + (data.$modified ? '[MODIFIED] ' : '') + (dispatch.base.protocolMap.code.get(code) || code) + '	' + data.toString('hex') + '\n')
	})
}