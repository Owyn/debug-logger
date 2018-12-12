const path = require('path'),
		fs = require('fs');

module.exports = function DebugLogger(dispatch) {
	const command = dispatch.commandl;
	let hook = null;
	let enabled = false;
	let filepath = path.join(__dirname, '..', '..', 'tera-proxy-' + Date.now() + '.log')
	let file = null;
	
	this.destructor = function()
	{
		if(enabled)
		{
			file.end('<---- TERA proxy UNLOADED ---->\r\n');
		}
	}
	
	command.add('logger', () => {
		enabled = !enabled;
		command.message('Logging' + (enabled ? 'enabled' : 'disabled'));
		if(enabled)
		{
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
			file.write("[" + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds() + ":" + today.getMilliseconds() + "]	" + (fromServer ? '<-' : '->') + '	' + (fake ? '[CRAFTED]	' : '') + (data.$silenced ? '[BLOCKED]	' : '') + (data.$modified ? '[EDITED]	' : '') + ( (!fake && !data.$silenced && !data.$modified) ? '         	' : '') + (dispatch.protocolMap.code.get(code) || code) + '	' + data.toString('hex') + '\r\n', (function(){}))
		});
	}
}