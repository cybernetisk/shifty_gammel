# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :template do
    title "MyString"
    description "MyText"
    start "2012-10-01 19:10:23"
    stop "2012-10-01 19:10:23"
    interval 1
  end
end
