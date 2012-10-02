# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :template do
    title "MyString"
    description "MyText"
    start Time.now
    stop Time.now
    interval 1

    trait(:with_shifts) {template_shift {[FactoryGirl.create(:template_shift, start:start, stop:1.hours.since(start))]}}
  end
end
