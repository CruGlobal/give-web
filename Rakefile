require 'rake'
require 'yaml'
require 'parallel'
require 'rspec/core/rake_task'

RSpec::Core::RakeTask.new(:selenium) do |t|
  t.pattern = Dir.glob('spec/selenium/selenium_spec.rb')
  t.rspec_opts = '--require browserstack_helper.rb --format documentation'
  t.verbose = false
end

task :default => :rspec

task rspec: :dotenv do
  if 'browserstack' == ENV['WEBDRIVER_FOR']
    CONFIG = YAML.load(File.read(File.join(File.dirname(__FILE__), 'browserstack.yml')))
    @num_parallel = CONFIG['browser_caps'].length
    Parallel.map([*1..@num_parallel], :in_processes => @num_parallel) do |task_id|
      ENV['TASK_ID'] = (task_id - 1).to_s
      Rake::Task['selenium'].invoke
      Rake::Task['selenium'].reenable
    end
  else
    Rake::Task['selenium'].invoke
  end
end

task :dotenv do
  require 'dotenv'
  Dotenv.load('.env.local', '.env')
end
