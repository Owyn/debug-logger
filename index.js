const path = require('path'),
	fs = require('fs')

module.exports = function DebugLogger(dispatch) {
	let filepath = path.join(__dirname, '..', '..', 'tera-proxy-' + Date.now() + '.log')
	let file = fs.createWriteStream(filepath, {highWaterMark: 1024*1024});
	
	process.on('exit', ()=> {
		file.end('<---- TERA proxy TERMINATED ---->\r\n');
	});
	
	this.destructor = function()
	{
		file.end('<---- TERA proxy UNLOADED ---->\r\n');
	}
	
	dispatch.hook('*', 'raw', { order: 999999, filter: { fake: null, silenced: null, modified: null} }, (code, data, fromServer, fake) => {
		let today = new Date();
	file.write("[" + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds() + ":" + today.getMilliseconds() + "]	" + (fromServer ? '<-' : '->') + '	' + (fake ? '[CRAFTED]	' : '') + (data.$silenced ? '[BLOCKED]	' : '') + (data.$modified ? '[EDITED]	' : '') + ( (!fake && !data.$silenced && !data.$modified) ? '         	' : '') + (dispatch.base.protocolMap.code.get(code) || code) + '	' + data.toString('hex') + '\r\n', (function(){}))
	})
}