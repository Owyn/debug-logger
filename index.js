const path = require('path'),
		fs = require('fs');

module.exports = function DebugLogger(dispatch) {
	const command = dispatch.command;
	let hook = null;
	let enabled = false;
	let filepath = null;
	let file = null;
	
	this.destructor = function()
	{
		if(enabled)
		{
			file.end('<---- TERA proxy UNLOADED ---->\r\n');
		}
	}
	
	command.add('log', () => {
		enabled = !enabled;
		command.message('Logging: ' + (enabled ? 'ON' : 'OFF'));
		if(enabled)
		{
			filepath = path.join(__dirname, '..', '..', 'tera-proxy-' + Date.now() + '.log');
			file = fs.createWriteStream(filepath, {highWaterMark: 1024*1024});
			file.write('<---- Hook ENABLED ---->\r\n');
			dohook();
		}
		else
		{
			dispatch.unhook(hook);
			file.end('<---- Hook DISABLED ---->\r\n');
		}
	});
	
	function dohook()
	{
		hook = dispatch.hook('*', 'raw', { order: 999999, filter: { fake: null, silenced: null, modified: null} }, (code, data, fromServer, fake) => {
			let today = new Date();
			file.write("[" + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds() + ":" + today.getMilliseconds() + "]	" + (fromServer ? '<-' : '->') + '	' + (fake ? '[CRAFTED]	' : '') + (data.$silenced ? '[BLOCKED]	' : '') + (data.$modified ? '[EDITED]	' : '') + ( (!fake && !data.$silenced && !data.$modified) ? '         	' : '') + (dispatch.dispatch.protocolMap.code.get(code) || code) + '	' + data.toString('hex') + '\r\n', (function(){}))
		});
	}
}