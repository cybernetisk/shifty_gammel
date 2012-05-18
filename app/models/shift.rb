class Shift < ActiveRecord::Base
  attr_accessible :comment, :end, :leasing, :start, :training, :shift_type_id
  belongs_to :task
  belongs_to :shift_type
end
