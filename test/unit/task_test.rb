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

    st.certifications << cert
    st.save

    return group, st, cert
  end

  test "user_task_certification" do
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
    assert_raise RuntimeError do
      s.user = u
    end

    u.user_groups << group

    assert_nothing_raised do
      s.user = u
    end
  end
end
