require 'test_helper'

class TemplateShiftTest < ActiveSupport::TestCase
    epoc = Time.strptime("0", "%s")
    epoc = epoc - epoc.utc_offset.seconds
    test "createShift" do
        now = Time.now

        shift_template = FactoryGirl.create(:template_shift, start: epoc + 2.hours, stop: epoc + 3.hours)
        shift_template.template = FactoryGirl.create(:template, start:now, interval:1)

        shift = shift_template.makeShift(1)
        
        assert_in_delta now + 1.days + 2.hours, shift.start, 1.seconds
        assert_in_delta now + 1.days + 3.hours, shift.end, 1.seconds

        assert_equal shift_template.shift_type, shift.shift_type
        assert_equal shift_template.comment, shift.comment
        assert_equal shift_template, shift.template

        shift.save
    end

    test "isApplied" do
        now = Time.now

        shift_template = FactoryGirl.create(:template_shift, :with_template, start: epoc + 2.hours, stop:epoc + 3.hours)

        assert_equal false, shift_template.isApplied(0)

        assert_equal 1, shift_template.template.make_period(0).length

        assert_equal false, shift_template.isApplied(-1)
        assert_equal true, shift_template.isApplied(0)
        assert_equal false, shift_template.isApplied(1)
    end
end
