class Task < ActiveRecord::Base
  attr_accessible :description, :title, :user_group_id, :user_id

  belongs_to :user
  belongs_to :user_group
  has_one :shift
  has_one :ticket

  def user=(new_user)
    if self.shift != nil && self.shift.shift_type.certifications.count != 0
        if new_user.user_groups.count == 0 || self.shift.shift_type.certifications.where(user_group_id: new_user.user_groups).count == 0
          raise "User does not meet certifications"
        end
    end
    super
  end
end
