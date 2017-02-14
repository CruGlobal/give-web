require 'rspec'
require_relative './spec_helper.rb'
require 'selenium-webdriver'
require_relative './helpers/string_helpers.rb'

RSpec.configure do |config|
  config.before(:all) do
    @base_url = ENV['BASE_URL']
    @verification_errors = []
    webdriver_for = (ENV['WEBDRIVER_FOR'] || 'chrome').to_sym
    @driver = Selenium::WebDriver.for webdriver_for
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
