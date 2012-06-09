class Shift < ActiveRecord::Base
  attr_accessible :comment, :end, :leasing, :start, :training, :shift_type_id
  belongs_to :task
  belongs_to :shift_type
  has_one :user, through: :task

  def self.getAvailableShifts
      shifts = Shift.joins(:task).where('tasks.user_id'=> nil) #remember to remove shifts that are finished
      shifts
  end
  
end
