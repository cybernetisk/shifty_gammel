source 'https://rubygems.org'

gem 'rails', '3.2.3'
# Bundle edge Rails instead:
# gem 'rails', :git => 'git://github.com/rails/rails.git'
gem "sentry-raven", :git => "https://github.com/getsentry/raven-ruby.git", :tag => '0.3.1'

group :development, :test do
  gem 'sqlite3'
  gem 'rake'
  gem 'yaml_db'
  gem 'ar_fixtures'
end
group :production do
  gem 'pg'
  gem 'thin'
end


# Gems used only for assets and not required
# in production environments by default.
group :assets do
  gem 'sass-rails',   '~> 3.2.3'
  gem 'coffee-rails', '~> 3.2.1'

  # See https://github.com/sstephenson/execjs#readme for more supported runtimes
  # gem 'therubyracer', :platform => :ruby

  gem 'uglifier', '>= 1.0.3'
end

gem 'jquery-rails'

# To use ActiveModel has_secure_password
gem 'bcrypt-ruby', '~> 3.0.0'

# For access control
gem 'cancan'

# To use Jbuilder templates for JSON
# gem 'jbuilder'

# Use unicorn as the app server
# gem 'unicorn'

# Deploy with Capistrano
# gem 'capistrano'

# To use debugger
# gem 'ruby-debug19', :require => 'ruby-debug'

# Railroady genererer diagrammer av bl.a. modellene
group :development, :test do
  gem 'railroady'
  gem 'factory_girl_rails'
end
