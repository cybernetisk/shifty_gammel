# Shifty
======

## Install instructions

### How to start up with ruby on rails on ubuntu:

1. Ruby on rails and shifty has some dependencies to other libraries that will haunt you later if you don't have them installed, so make sure you have libsqlite3-dev, libpq-dev and nodejs installed from your repository

   (should be something like `apt-get install libsqlite3-dev libpq-dev nodejs`)

2. We need rvm to manage ruby version, so follow instructions on:
  
   https://rvm.io/rvm/install/
	
   If you don't have curl installed, you can get it from the repository.

3. Make sure bundler is installed: `gem install bundler`

4. In the shifty folder, run `bundle install`. This will install rails and all other dependencies

5. To set up the database, run: `rake db:migrate`

6. You should be finished now, try to run `rails s` to start the webserver.

### For OS X, follow these instructions:

1. Make sure you have xcode (and preferably the command line tools too) installed

2. Install homebrew:

	http://mxcl.github.com/homebrew/

3. Install nodejs: `brew install nodejs`

4. We now need to install bundler `gem install bundler`

5. This will install rails and all dependencies: `bundler install`

6. Set up the database: `rake db:migrate`

7. Everything should now be ready, run `rails s` and go to http://localhost:3000/


### Fixtures

To get testdata, run `rake db:data:load`.
