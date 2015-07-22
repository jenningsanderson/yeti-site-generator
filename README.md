Yeti Site Generator
===================
A Very lightweight static website generator built on the Liquid Templating Engine.

##Installation
1. Clone the repository
2. Run ```npm install``` to install the node dependencies.


##Building a Page

	yetigen build <path/to/page.html>


Structure of a Yeti Page:
	
	---
	layout: default
	destination: '/Users/jenningsanderson/Desktop/test.html'
	title: "This is a test"
	---

	<p>This is my sample file</p>

	<div id="map" style="width:100%;height:600">

	<script>alert('yup')</alert>
