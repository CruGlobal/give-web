require 'yaml'
require 'rspec'
require_relative './spec_helper.rb'
require 'selenium-webdriver'
require_relative './helpers/string_helpers.rb'
require 'rest_client'
require 'json'
require 'securerandom'

TASK_ID = (ENV['TASK_ID'] || 0).to_i
BUILD_NUMBER = ENV['BUILD_DISPLAY_NAME'] || SecureRandom.uuid
CONFIG = YAML.load(File.read(File.join(File.dirname(__FILE__), '../browserstack.yml')))

CONFIG['user'] = ENV['BROWSERSTACK_USERNAME'] || CONFIG['user']
CONFIG['key'] = ENV['BROWSERSTACK_ACCESS_KEY'] || CONFIG['key']

RSpec.configure do |config|
  config.around(:example) do |example|
    @base_url = ENV['BASE_URL']
    @verification_errors = []

    @caps = CONFIG['common_caps'].merge(CONFIG['browser_caps'][TASK_ID])
    @caps['build'] = BUILD_NUMBER
    @caps['name'] = example.metadata[:filename]

    @driver = Selenium::WebDriver.for(:remote,
                                      :url => "http://#{CONFIG['user']}:#{CONFIG['key']}@#{CONFIG['server']}/wd/hub",
                                      :desired_capabilities => @caps)
    @driver.manage.window.size = Selenium::WebDriver::Dimension.new(1024, 768)
    @wait = Selenium::WebDriver::Wait.new(interval: 0.5, timeout: ENV['WEBDRIVER_WAIT_TIMEOUT'].to_i || 7)
    @session_id = @driver.session_id
    begin
      example.run
    ensure
      @driver.quit
      if example.exception
        # Marks failed tests
        RestClient::Request.execute(method: :put, user: CONFIG['user'], password: CONFIG['key'],
                                    url: "https://www.browserstack.com/automate/sessions/#{@session_id}.json",
                                    headers: {content_type: :json},
                                    payload: {status: 'failed', reason: example.exception.message}.to_json)
      end
    end
  end
end
