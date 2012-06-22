class Shift < ActiveRecord::Base
  attr_accessible :comment, :end, :leasing, :start, :training, :shift_type_id
  belongs_to :task
  belongs_to :shift_type
  has_one :user, through: :task

  def self.getAvailableShifts
      shifts = Shift.joins(:task).where('tasks.user_id'=> nil) #remember to remove shifts that are finished
      shifts
  end

  def self.start_date
    return ""
  end

  def date
    if self.start == nil
      return ""
    end
    self.start.strftime("%Y-%m-%d")
  end
  
  def date=(val)
    self.start = DateTime.strptime(val, "%Y-%m-%d")
  end

  def duration
    if self.start == nil || self.end == nil
      return 0
    end
    self.end - self.start
  end

  def duration=(val)
    self.end = val.hours.since self.start
  end
end
