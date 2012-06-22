require 'test_helper'

class ShiftTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
  test "date_get" do
    s = Shift.new

    s.start = DateTime.now

    assert_equal s.date, DateTime.now.strftime("%Y-%m-%d")
  end

  test "date_set" do
    s = Shift.new

    t = DateTime.now
    s.date = t.strftime("%Y-%m-%d")
    
    assert_not_nil s.start

    assert_equal t.strftime("%Y-%m-%d"), s.start.strftime("%Y-%m-%d")
  end

  test "get_duration" do

    s = Shift.new

    t = DateTime.now

    s.start = t

    s.end = 1.hours.since t

    assert_equal s.duration, 1.hours
  end

  test "set_duration" do
    s = Shift.new

    t = DateTime.now

    s.start = t
    s.duration = 1

    assert_equal s.end, 1.hours.since(t)
  end
end
