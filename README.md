Yeti Site Builder
=================

A collection of 


Yeti-Pages
----------











Site-Generator
--------------
A Very lightweight static website generator built on the Liquid Templating Engine.

### Installation
1. Clone the repository
2. Run ```npm install``` to install the node dependencies.


### Building a Page

	yetigen build <path/to/page.html>


#### Structure of a Yeti Page

Pages contain YAML frontmatter which is parsed and available as variables within the page. This works the same way as Jekyll.
	
	---
	layout: default
	destination: '/Users/jenningsanderson/Desktop/test.html'
	title: "This is a test"
	---

	<p>This is my sample file</p>

	<div id="map" style="width:100%;height:600">

	<script>alert('yup')</alert>

### Templates
The ```templates``` directory contains both ```_layouts``` and ```_includes```, the namining conventions of ```.liquid``` and `_` are required to appease Liquid.  When a page builds, it will pull the layout from the frontmatter, so add layouts here.

### Customization
In templates, there is an assets folder with styles. By default, the templates search for an assets folder at the web root, so copy these assets there with the following command:
	
	yetigen install <path/to/assets/>

