# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :template_shift do
    start "2012-10-01 19:10:13"
    stop "2012-10-01 19:10:13"
    shift_type_id { FactoryGirl.create(:shift_type) }
    comment "MyString"
    training false
  end
end
