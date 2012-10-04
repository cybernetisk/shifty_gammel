require 'test_helper'

class TemplateShiftTest < ActiveSupport::TestCase
    test "createShift" do
        now = Time.now

        shift_template = FactoryGirl.create(:template_shift, start: now + 2.hours, stop: now + 3.hours)
        shift_template.template = FactoryGirl.create(:template, start:now)
        
        shift = shift_template.makeShift(1.hours.since now)

        assert_equal 3.hours.since(now), shift.start, "Shift start should be 2 + 1 hour after start"
        assert_equal 4.hours.since(now), shift.end, "Shift end should be 2 + 2 hours after start"

        assert_equal shift_template.shift_type, shift.shift_type
        assert_equal shift_template.comment, shift.comment
        assert_equal shift_template, shift.template

        shift.save
    end
end
