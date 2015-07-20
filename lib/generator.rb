require 'liquid'


class Page

	Liquid::Template.file_system = Liquid::LocalFileSystem.new('./templates/_includes') 
 
	attr_reader :layout_file, :head_file, :header_file, :footer_file

	def initialize(args)
		@layout_file = args[:layout] || './templates/_layouts/default.liquid'
	end

	def parse_templates

		# @head   = Liquid::Template.parse File.read (head_file)
		# @header = Liquid::Template.parse File.read (header_file)
		# @footer = Liquid::Template.parse File.read (footer_file)
		
		@page = Liquid::Template.parse File.read(layout_file) 
	end

	# def render_partials
	# 	@head.render(data)
	# 	@header.render(data)
	# 	@footer.render(data)
	# end

	def render
		@page.render('content'=> "testing")
	end
end


