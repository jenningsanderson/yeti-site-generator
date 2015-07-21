var githubhook = require('github-hook');



module.exports = function (src, options){

	var github = githubhook({
		host: '0.0.0.0',
		port: 3420,
		secret: src.secret
	})

	github.listen();

	// console.log(options)

	github.on('push', function (repo, ref, data) {
		console.log(repo, ref, data)
	});

	// github.on('event:reponame', function (ref, data) {

	// });

	// github.on('event:reponame:ref', function (data) {

	// });

	// github.on('reponame', function (event, ref, data) {

	// });

	// github.on('reponame:ref', function (event, data) {

	// });
}