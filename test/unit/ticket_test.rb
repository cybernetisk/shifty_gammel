require 'test_helper'

class TicketTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
  test "Assigning user and expires" do
    m = Ticket.new

    u = User.new

    assert_nil m.expires, "Expires should not have been set yet"
    m.user = u

    assert_not_nil m.expires, "Expires should be set"
    assert_not_nil m.user, "User should be set"
  end
end
