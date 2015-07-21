var http = require('http')
var createHandler = require('github-webhook-handler')

module.exports = function (src, options){

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
	})
}