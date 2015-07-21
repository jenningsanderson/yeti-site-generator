var http = require('http')
var createHandler = require('github-webhook-handler')
var fs = require('fs')
var exec = require("child_process").exec;

module.exports = function (src, options){

	if (src.config == null){
		throw "Error! Need a configuration JSON File"
	}else{
		config = JSON.parse(fs.readFileSync(src.config))
	}

	var handler = createHandler({ path: '/webhook', secret: src.secret })
 
	http.createServer(function (req, res) {
	  handler(req, res, function (err) {
	    res.statusCode = 404
	    res.end('no such location')
	  })
	}).listen(3420)

	handler.on('error', function (err) {
  		console.error('Error:', err.message)
	})
 
	handler.on('push', function (event) {
	  console.log('Received a push event for %s to %s',
	    event.payload.repository.name,
	    event.payload.ref)

	  if (event.payload.repository.name == config.name){
		  	console.log("Pulling and publishing for " + config.name)
				//Pull the updated repository
				exec('cd ' + config.local+' && git pull', function(err, stdout, stderr){
					if(err) console.log(err)
					if(stdout) console.log(stdout)
					if(stderr) console.log(stderr)

					//If no error, then use yetigen to build it
					if(!err){
						console.log("Now building with yetigen")
						config.pages.forEach(function(repoPath){
			  				console.log(repoPath)
			  				exec('/home/jennings/yeti-site-generator/bin/yetigen build ' + config.local+"/"+repoPath, function (err, stdout, stderr) {
								if(err) console.log(err)
					  			if(stdout) console.log(stdout)
					  			if(stderr) console.log(stderr)
							});
						});
					}
				})
		  }
	});
}