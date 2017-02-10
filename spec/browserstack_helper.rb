require 'yaml'
require 'rspec'
require_relative './spec_helper.rb'
require 'selenium-webdriver'
require_relative './helpers/string_helpers.rb'

RSpec.configure do |config|
  config.before(:all) do
    @base_url = ENV['BASE_URL']
    @verification_errors = []
    webdriver_for = (ENV['WEBDRIVER_FOR'] || 'browserstack').to_sym
    @driver = if :browserstack == webdriver_for
                TASK_ID = (ENV['TASK_ID'] || 0).to_i
                CONFIG = YAML.load(File.read(File.join(File.dirname(__FILE__), '../browserstack.yml')))
                CONFIG['user'] = ENV['BROWSERSTACK_USERNAME'] || CONFIG['user']
                CONFIG['key'] = ENV['BROWSERSTACK_ACCESS_KEY'] || CONFIG['key']
                @caps = CONFIG['common_caps'].merge(CONFIG['browser_caps'][TASK_ID])
                @caps['name'] = ENV['name']
                Selenium::WebDriver.for(:remote,
                                        :url => "http://#{CONFIG['user']}:#{CONFIG['key']}@#{CONFIG['server']}/wd/hub",
                                        :desired_capabilities => @caps)
              else
                Selenium::WebDriver.for webdriver_for
              end
    @driver.manage.window.size = Selenium::WebDriver::Dimension.new(1024, 768)
    @wait = Selenium::WebDriver::Wait.new(interval: 0.5, timeout: ENV['WEBDRIVER_WAIT_TIMEOUT'].to_i || 7)
  end

  config.before(:each) do
    @driver.get @base_url
    @driver.manage.delete_all_cookies
  end

  config.after(:all) do
    @driver.quit
  end
end
