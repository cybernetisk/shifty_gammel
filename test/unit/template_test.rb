require 'test_helper'

class TemplateTest < ActiveSupport::TestCase
  test "apply template" do
    now = Time.now
    template = FactoryGirl.create(:template, start:now)

    shift_template = FactoryGirl.create(:template_shift, start:now, stop:2.hours.since(now), template:template)
    
    shift_template2 = FactoryGirl.create(:template_shift, start:2.hours.since(now), stop:3.hours.since(now), template:template)
    
    shift = template.apply(2.hours.since now)
    assert_equal 2, shift.length
    assert_equal shift_template, shift[0].template
    assert_equal shift_template2, shift[1].template

  end

  test "get period start" do
    now = Time.now
    template = FactoryGirl.create(:template)
    template.start = now
    template.interval = 7

    x = template.get_period_start(1)
    assert_equal 7.days.since(now), x
  end

  test "check_period" do
    now = Time.now
    template = FactoryGirl.create(:template)
    template.start = now
    template.save

    assert_equal false, template.check_period(0)

    template.make_period(0)

    assert_equal false, template.check_period(0) #should still be false, no shifts here

    template = FactoryGirl.create(:template, :with_shifts)
    shifts = template.make_period(0)
    shifts = template.make_period(2)

    assert !template.check_period(-1)
    assert template.check_period(0)
    assert !template.check_period(1)
    assert template.check_period(2)

  end

  test "make_period" do
    template = FactoryGirl.create(:template, :with_shifts, start:Time.now, interval:7)

    # this will return the generated shifts
    shifts = template.make_period 1

    assert_equal 1,  shifts.length 
    assert_equal shifts, template.template_shift[0].shift
  end
end
