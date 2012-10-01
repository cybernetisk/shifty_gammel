require 'test_helper'

class TemplateTest < ActiveSupport::TestCase
  test "apply template" do
    now = Time.now
    template = FactoryGirl.create(:template, start:now)

    shift_template = FactoryGirl.create(:template_shift)
    shift_template.template = template
    shift_template.start = 1.hours.since now
    shift_template.stop = 2.hours.since now
    
    shift_template2 = FactoryGirl.create(:template_shift)
    shift_template2.template = template
    shift_template2.start = 2.hours.since now
    shift_template2.stop = 3.hours.since now
        
    shift_template.save
    shift_template2.save

    shift = template.apply(2.hours.since now)
    assert_equal 2, shift.length
    assert_equal shift_template, shift[0].template
    assert_equal shift_template2, shift[1].template

    #Check that the offset is correct
    end
end
