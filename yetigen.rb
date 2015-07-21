require_relative './lib/generator.rb'


if __FILE__ == $0

	test_site = Page.new({in: ARGV[0]})
	
	test_site.parse_templates
	test_site.parse_page

	test_site.publish
end