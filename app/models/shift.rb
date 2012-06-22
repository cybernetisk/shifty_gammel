class Shift < ActiveRecord::Base
  attr_accessible :comment, :end, :leasing, :start, :training, :shift_type_id
  belongs_to :task
  belongs_to :shift_type
  has_one :user, through: :task

  def self.getAvailableShifts
      shifts = Shift.joins(:task).where('tasks.user_id'=> nil).order('shifts.start') #remember to remove shifts that are finished
      shifts
  end
  
  def self.findForDate(date)
      date = date+"%";
      shifts = Shift.joins(:task).where("tasks.user_id IS NULL AND shifts.start LIKE ?", date) #remember to remove shifts that are finished
      shifts
  end
  
  def self.getUpcomingShifts
      shifts = Shift.joins(:task).where('tasks.user_id'=> nil).order('shifts.start').limit(10) #remember to remove shifts that are finished
      shifts
  end
end
