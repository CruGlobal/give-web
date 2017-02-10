class SeleniumCommand
  include ::RSpec::Matchers
  # Selenium IDE commands we handle - all other commands are skipped
  VALID_COMMANDS = %i(open click click_and_wait type type_and_wait assert_text assert_not_text wait_for_element_present
                      assert_element_present assert_element_not_present assert_location assert_not_location pause
                      assert_body_text assert_body_not_text select select_and_wait assert_css_count
                      assert_not_css_count wait_for_visible assert_visible assert_not_visible).freeze

  # Skip the wait for element for these commands (not element specific)
  SKIP_WAIT = %i(open pause assert_location assert_not_location).freeze

  # List of positive assertion commands, used to decide whether expect().to or expect().not_to should be used
  POSITIVE_ASSERTIONS = %i(assert_text assert_element_present assert_location assert_body_text assert_css_count
                           assert_visible).freeze

  # JavaScript used to determine if current page is ready.
  BROWSER_READY_SCRIPT = <<~JAVASCRIPT
    try {
      if(document.readyState !== 'complete') return false;
      if(window.jQuery) {
        if(window.jQuery.active) return false;
        if(window.jQuery.ajax && window.jQuery.ajax.active) return false;
      }
      if(window.angular) {
        var injector = window.angular.element(document.querySelector('body')).injector();
        var $rootScope = injector.get('$rootScope');
        if($rootScope.$$phase !== null) return false;
        var $http = injector.get('$http');
        if($http && $http.pendingRequests.length > 0) return false;
      }
      return true;
    }
    catch(err) {
      return false;
    }
  JAVASCRIPT

  attr_accessor :command, :target, :value

  def initialize(command:, target:, value:)
    self.command = command.underscore.to_sym

    case self.command
      # assert_body_text sends the assertion value as target and assumes a target of BODY element
      when :assert_body_text, :assert_body_not_text
        self.target = 'xpath=//body'
        self.value = target
      else
        self.target = target
        self.value = value
    end
  end

  def execute(driver:, wait:, base_url:)
    # Skip any invalid commands
    return unless VALID_COMMANDS.include? command
    self.driver = driver
    self.wait = wait
    self.base_url = base_url

    # For convenience, we wait for all elements to be present before executing commands on them.
    # This skips the wait for commands in SKIP_WAIT as well as commands that don't appear to have a valid
    # target element
    wait_for_element unless SKIP_WAIT.include? command

    # Wait for the browser to signal it's ready. This means dom is loaded, ajax is done and angular
    # digest cycles have finished.
    wait_for_browser_ready

    # Execute the command
    send(command) if respond_to? command, true
  end

  private

  attr_accessor :element, :driver, :wait, :base_url

  # --------------------------------------
  #   Navigation Commands
  # --------------------------------------

  def open
    driver.get(base_url + target)
  end

  def click
    wait_for_element_enabled
    element.click
  end

  alias_method :click_and_wait, :click

  # --------------------------------------
  #   Wait Commands
  # --------------------------------------

  def pause
    # target is in milliseconds
    sleep(target.to_f/1000)
  end

  def wait_for_visible
    wait.until { element.displayed? }
  end

  # --------------------------------------
  #   Manipulation Commands
  # --------------------------------------

  def type
    wait_for_element_enabled
    element.clear
    element.send_keys value
  end

  alias_method :type_and_wait, :type

  def select
    wait_for_element_enabled
    Selenium::WebDriver::Support::Select.new(element).select_by(*parse_select(value))
  end

  alias_method :select_and_wait, :select

  # --------------------------------------
  #   Assertion Commands
  # --------------------------------------

  def assert_text
    expect(element.text).send(assertion, match(to_regexp(value)))
  end

  alias_method :assert_not_text, :assert_text
  alias_method :assert_body_text, :assert_text
  alias_method :assert_not_body_text, :assert_text

  def assert_location
    expect(driver.current_url).send(assertion, match(to_regexp(target)))
  end

  alias_method :assert_not_location, :assert_location

  def assert_element_present
    expect(element_present?).send(assertion, be(true))
  end

  alias_method :assert_element_not_present, :assert_element_present

  def assert_css_count
    elements = driver.find_elements(*parse_target)
    expect(elements.size).send(assertion, eq(value.to_i))
  end

  alias_method :assert_not_css_count, :assert_css_count

  def assert_visible
    expect(element.displayed?).send(assertion, be(true))
  end

  alias_method :assert_not_visible, :assert_visible


  # --------------------------------------
  #   Helper Methods
  # --------------------------------------

  def parse_target
    how, _, what = target.partition('=')
    if %w(name css id link xpath tag_name).include? how
      [how.to_sym, what]
    else
      [:xpath, target]
    end
  end

  def parse_select(val)
    how, _, what = val.partition('=')
    if %w(value index).include? how
      [how.to_sym, what]
    elsif 'label' == how
      [:text, what]
    else
      [:text, val]
    end
  end

  def wait_for_element
    return if target.empty?
    how, what = parse_target
    wait.until { self.element = driver.find_element(how, what) }
  end

  def wait_for_element_enabled
    wait.until { element.enabled? }
  end

  def wait_for_browser_ready
    wait.until do
      driver.execute_script BROWSER_READY_SCRIPT
    end
  end

  def to_regexp(pattern)
    # Escape string, then replace all escaped asterisks with wildcard
    /^#{Regexp.escape(pattern).gsub('\*', '[\s\S]*')}$/
  end

  def assertion
    POSITIVE_ASSERTIONS.include?(command) ? :to : :not_to
  end

  def element_present?
    how, what = parse_target
    driver.find_element(how, what)
    true
  rescue Selenium::WebDriver::Error::NoSuchElementError
    false
  end
end