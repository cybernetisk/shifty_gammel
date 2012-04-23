class Shift < ActiveRecord::Base
  attr_accessible :comment, :end, :leasing, :start, :training, :user_id, :shift_type_id
  belongs_to :user
  belongs_to :shift_type
end
