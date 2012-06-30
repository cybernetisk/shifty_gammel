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
    s.duration = 1.hours
    
    assert_equal s.end, 1.hours.since(t)
    assert_equal s.duration, 1.hours
  end

  test "duration_equals_end" do
    s = Shift.new

    start = DateTime.now
    diff = 2.hours
    stop = diff.since start

    s.start = start
    s.end = stop

    assert_equal s.duration, diff
    
    s.duration = diff
    assert_equal s.end, stop

  end


  test "set_time" do
    s = Shift.new
    s.start = DateTime.now
    s.time = "18:00"

    assert_equal "18:00", s.start.strftime("%H:%M")
    s.time = "19:00"

    assert_equal "19:00", s.start.strftime("%H:%M")

  end
  test "time_and_duration" do

    s = Shift.new
    s.start = DateTime.now
    s.duration = 8.hours
    
    s.start = 1.hours.since DateTime.now
    
    assert_equal 8.hours, s.duration
  end
  
  test "get_time" do
    s = Shift.new
    t = DateTime.now
    s.start = t
    assert_equal s.time, s.start.strftime("%H:%M")
  end
end
