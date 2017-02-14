require 'nokogiri'
require_relative '../helpers/selenium_command.rb'

def selenium_test(html, filename)
  title = html.css('title')[0].text
  RSpec.describe "#{filename}", filename: filename, title: title do
    before(:each) do
      @commands = (html.css 'tbody tr').map do |command|
        args = command.css 'td'
        SeleniumCommand.new command: args[0].text, target: args[1].text, value: args[2].text
      end
    end

    it " - \"#{title}\"" do
      @commands.each { |command| command.execute driver: @driver, wait: @wait, base_url: @base_url }
    end
  end
end

Dir.glob('selenium/**/*').each do |file|
  next if File.directory? file
  html = Nokogiri::HTML(open(file))
  next unless (html.css 'head[profile=\'http://selenium-ide.openqa.org/profiles/test-case\']').first
  selenium_test html, file
end

