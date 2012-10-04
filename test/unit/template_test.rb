require 'test_helper'

class TemplateTest < ActiveSupport::TestCase
  now = Time.at(0)
  test "apply template" do
    template = FactoryGirl.create(:template, start:now)

    shift_template = FactoryGirl.create(:template_shift, start:now, stop:2.hours.since(now), template:template)
    
    shift_template2 = FactoryGirl.create(:template_shift, start:2.hours.since(now), stop:3.hours.since(now), template:template)
    
    shift = template.apply(0)
    assert_equal 2, shift.length
    assert_equal shift_template, shift[0].template
    assert_equal shift_template2, shift[1].template

  end

  test "get period start" do
    template = FactoryGirl.create(:template)
    template.start = now
    template.interval = 7

    x = template.get_period_start(1)
    assert_equal 7.days.since(now), x
  end

  test "check_period" do
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
    template = FactoryGirl.create(:template, :with_shifts, start:Time.now, stop:Time.now + 10.days, interval:1)

    # this will return the generated shifts
    shifts = template.make_period 1

    assert_equal 1,  shifts.length 
    assert_equal shifts, template.template_shift[0].shift
  end

  test "make_many_periods" do
    template = FactoryGirl.create(:template, start:now, stop:now + 18.days, interval:1)
    ts = FactoryGirl.create(:template_shift, start:now, stop:now + 1.hours)
    template.template_shift << ts

    (0..template.count_intervals).step(2).each do |period|
      template.make_period(period)
    end 

    assert_equal 10, ts.shift.length

    10.times.each do |i|
      assert_in_delta (now + (2 * i).days), ts.shift[i].start, 0.1.seconds
    end
  end

  test "template_careful_apply" do
    template = FactoryGirl.create(:template, start:now, stop:now + 18.days, interval:2)
    ts = FactoryGirl.create(:template_shift, start:now, stop:now + 1.hours)
    template.template_shift << ts

    assert_equal 1, template.careful_apply(0).length

    assert_equal 1, template.careful_make_period(0).length

    assert_equal 0, template.careful_apply(0).length

    assert_equal 1, template.careful_apply(1).length

    ts2 = FactoryGirl.create(:template_shift, template:template, start:now, stop:now + 1.hours)
    template.template_shift << ts2

    assert_equal 1, template.careful_apply(0).length
    assert_equal 2, template.careful_apply(1).length
  end
end
