namespace :shifty do
    desc "Fix initial stuff for shifty development"
    task :init => :environment do
        print "lol"
        Rake::Task["db:migrate"].invoke
        Rake::Task["data:halfyear"].invoke
    end
end
