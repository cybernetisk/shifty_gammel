# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do

epoc = Time.strptime("0", "%s")
epoc = epoc - epoc.utc_offset.seconds
  factory :template do
    title "MyString"
    description "MyText"
    start Time.now.beginning_of_year
    stop Time.now.end_of_year
    interval 7

    trait(:with_shifts) {template_shift {[FactoryGirl.create(:template_shift, start:epoc, stop:epoc + 1.hours)]}}
  end
end
