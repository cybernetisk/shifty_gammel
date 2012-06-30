class Shift < ActiveRecord::Base
  attr_accessible :comment, :end, :leasing, :start, :training, :shift_type_id, :date, :duration
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

  def hour
    self.start.hour
  end

  def minutes
    self.start.minutes
  end


  def time
    if self.start == nil
      return ""
    end
    self.start.strftime("%H:%M")
  end
  
  def time=(val)
    hour, minute = val.split(":").map { |x| x.to_i }
    
    self.start = self.start.change(:hour=>hour, :min=>minute)
  end

  def duration
    if self.start == nil || self.end == nil
      return 0
    end
    self.end - self.start
  end

  def duration=(val)
    self.end =  val.since self.start
  end
end
