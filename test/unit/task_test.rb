require 'test_helper'

class TaskTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
  test "user_task_no_shift" do
    t = Task.new

    t.user = User.first
  end

  def setupCert
    group = UserGroup.new
    group.name = "testy"
    group.save

    st = ShiftType.new
    st.description = "for unit test"
    st.title = "shift type title"
    st.location = "kjelleren"
    st.save
    
    cert = Certification.new
    cert.shift_type_id = st
    cert.user_group = group
    cert.shift_type = st
    cert.save

    return group, st, cert
  end

  test "user_task_missing_certification" do
    group, st, cert = setupCert

    s = Shift.new
    s.shift_type = st

    s.leasing = false
    s.training = false
    s.comment = "lol"
    s.start = Time.now
    s.task = Task.new
    s.task.title = "lol"
    s.task.description = "Hei"
    s.duration = 8

    s.save

    u = User.new
    u.admin = false
    u.username = "hei"
    u.password = "lol"
    u.save
    
    s.task.shift = s
    s.task.user = u
    assert_equal false, s.task.save, "Save failed"
    
    u.user_groups << group
    u.save
    print u.user_groups
    print s.shift_type.certifications.where(user: u).count
    print s.shift_type
    print s.shift_type.certifications
    assert_equal true, s.task.save, "Save succeded"
  end
end
