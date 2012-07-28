require 'test_helper'

class UserTest < ActiveSupport::TestCase
  test "withdraw_ticket" do
    u = FactoryGirl.create(:user)
    
    assert !u.withdraw(30), "Should not be able to withdraw tokens"
  end

  test "expired_ticket" do
    u = FactoryGirl.create(:user)
    FactoryGirl.create(:ticket, expires:2.days.ago, value:400, user:u)
    assert_equal 0, u.tickets_sum, "Still shouldn't have any tickets"
    assert !u.withdraw(30), "Should not be able to withdraw ticket that has expired"
  end
  

  test "valid_ticket" do
    u = FactoryGirl.create(:user)
    
    FactoryGirl.create(:ticket, expires:2.days.from_now, value:400, user:u)
    
    assert_equal 400, u.tickets_sum, "Should have 400 ticets"
    assert u.withdraw(200), "Should be able to withdraw 200 tokens"
    assert_equal 200, u.tickets_sum, "Should have 200 tickets left"
  end

  test "tickets_with_different_dates" do
    u = FactoryGirl.create(:user)
    
    a = FactoryGirl.create(:ticket, expires:2.days.from_now.to_date, value:400, user:u)
    b = FactoryGirl.create(:ticket, expires:4.days.from_now.to_date, value:400, user:u)
    
    assert_equal 800, u.tickets_sum, "Should have 800 tickets"
    assert u.withdraw(500)

    assert_equal 4, u.tickets.count, "Should have four tickets now"
    
    tickets = u.tickets.find(:all, :conditions=>['value < 0'])

    assert_equal 2, tickets.count, "Two of them should be negative"
    # check order of withdrawls and sum
    assert_equal [-400,-100], tickets.map{ |t| t.value }, "Should have one ticket on -400 and one with -100"
    assert_equal [a.expires, b.expires], tickets.map{|t| t.expires}, "First ticket should be charged first"

    assert !u.withdraw(301)
    assert u.withdraw(300)
    
    assert_equal 0, u.tickets_sum
  end
end
