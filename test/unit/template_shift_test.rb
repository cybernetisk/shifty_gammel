require 'test_helper'

class TemplateShiftTest < ActiveSupport::TestCase
    test "createShift" do
        now = Time.now
        template = FactoryGirl.create(:template, start:now)

        shift_template = FactoryGirl.create(:template_shift, template:template)
        shift_template.start = 2.hours.since now
        shift_template.stop = 3.hours.since now
        shift_template.save

        shift = shift_template.makeShift(1.hours.since now)

        assert_equal 3.hours.since(now), shift.start, "Shift start should be 2 + 1 hour after start"
        assert_equal 4.hours.since(now), shift.end, "Shift end should be 2 + 2 hours after start"

        assert_equal shift.comment, shift_template.comment
        assert_equal shift.template, shift_template
    end
end
