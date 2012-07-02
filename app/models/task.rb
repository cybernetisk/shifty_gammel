class Task < ActiveRecord::Base
  attr_accessible :description, :title, :user_group_id, :user_id

  belongs_to :user
  belongs_to :user_group
  has_one :shift
  has_one :ticket

  validates_each :user do |record, attr, value|
    if record.shift != nil && record.shift.shift_type.certifications.where(user: value).count == 0
      record.errors.add(attr, "User does not have certification")
    end
  end
  
end
