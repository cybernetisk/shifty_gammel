FactoryGirl.define do
  factory :user do
    username 'loluser'
    password 'lolpassword'
    admin false

    factory :admin do
        username "loladmin"
        admin true
    end
  end

#end

#FactoryGirl.define do
  factory :shift do
    start DateTime.now
    duration 8.hours

    factory :full_shift do
      association :user, factory: :user
      association :shift_type, factory: :shift_type
    end
  end

#end

#FactoryGirl.define do
  factory :shift_type do |st|
    st.ticket_value 10
    st.location "Escape"
    st.title "Bartender"
    st.description "Et skift i baren"
  end

  factory :ticket do |t|
    t.value 10
    t.comment "Test ticket"
    t.expires 5.days.since Date.today
  end
end