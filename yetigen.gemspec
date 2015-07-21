Gem::Specification.new do |s|
  s.name              = "Yeti Site Generator"
  s.version           = "0.1.0"
  s.platform          = Gem::Platform::RUBY
  s.authors           = ["Jennings Anderson"]
  s.email             = ["jennings.anderson@colorado.edu"]
  s.homepage          = "http://github.com/jenningsanderson/yeti-site-generator"
  s.summary           = "A quick and dirty static site generator; mostly a wrapper on Liquid with Jekyll like aspects"
  s.description       = "A lot of development happening here... hang tight!"
  s.rubyforge_project = s.name
  s.license           = "MIT"

  # If you have runtime dependencies, add them here
  s.add_runtime_dependency "yaml"
  s.add_runtime_dependency "liquid" #This is an important dependency to allow the geo calculations

  # The list of files to be contained in the gem
  s.files         = `git ls-files`.split("\n")
  s.executables   = `git ls-files`.split("\n").map{|f| f =~ /^bin\/(.*)/ ? $1 : nil}.compact

  s.require_path = 'lib'

end
