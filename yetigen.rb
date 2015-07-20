require_relative './lib/generator.rb'


if __FILE__ == $0


	test_site = Page.new({})
	test_site.parse_templates

	puts test_site.render

	File.write('index.html', test_site.render)


end