require 'test_helper'

class ShiftTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end

  test "ticket_creation" do
    # Create a shift, and check that the ticket is created as it should.
    s = FactoryGirl.build(:full_shift)

    #just to check that it hasn't been set before save
    assert_nil s.ticket
    s.save

    assert_not_nil s.ticket "Ticket should have been created"
    assert_equal s.ticket.value,s.shift_type.ticket_value, "Ticket should have default value"
    
    m = FactoryGirl.create(:ticket, value:38)
    s.ticket = m

    assert_equal s.ticket, m, "Existing ticket was replaced"
  end

  test "end_check" do
    s = Shift.new

    tmp = DateTime.now
    s.end = tmp
    assert_equal tmp, s.end
  end

  test "date_get" do
    s = Shift.new

    s.start = DateTime.now

    assert_equal DateTime.now.strftime("%Y-%m-%d"), s.date
  end

  test "date_set" do
    s = Shift.new

    t = Time.now

    time = -4.days.from_now
    s.start = time

    s.date = t.strftime("%Y-%m-%d")
    
    assert_not_nil s.start
    
    assert_equal t.strftime("%Y-%m-%d"), s.start.strftime("%Y-%m-%d")
    assert_equal time.strftime("%H:%M"), s.start.strftime("%H:%M")
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

    t = Time.now

    s.start = t
    s.duration = 1.hours
    
    assert_equal s.end, 1.hours.since(t)
    assert_equal s.duration, 1.hours
    
    s.duration = "#{1.hours}"
    assert_equal s.end, 1.hours.since(t)
  end

  test "start_plus_duration_equals_end" do
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
    assert_equal s.start.strftime("%H:%M"), s.time
  end

  test "signed_by" do
    s = FactoryGirl.build(:shift)
    u = FactoryGirl.build(:user)
    
    s.signed_by = u
    
    assert_not_nil s.signed_by
  end
end
