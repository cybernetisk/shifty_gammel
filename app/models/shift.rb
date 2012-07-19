class Shift < ActiveRecord::Base
  attr_accessible :comment, :end, :leasing, :training, :shift_type_id, :start, :date, :duration, :time, ticket_id
  #belongs_to :task
  belongs_to :shift_type
  belongs_to :ticket
  belongs_to :user
  #has_one :user, through: :task
  
  def user
    self.task.user
  end

  def user=(new_user)
    self.task.user = new_user
  end

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
  
  def start=(val)
    duration = self.duration
    self[:start] = val
    self.duration = duration.seconds
  end
  
  def start
    self[:start]
  end

  def date
    if self[:start] == nil
      return ""
    end
    self.start.strftime("%Y-%m-%d")
  end
  
  def date=(val)
    p = DateTime.strptime val, "%Y-%m-%d"
    if self.start == nil
      self.start = p
    else
      self.start = self.start.change :year=>p.year, :month=>p.month, :day=>p.day
    end
  end

  def hour
    @start.hour
  end

  def minutes
    @start.minutes
  end

  def time
    if self.start == nil
      return ""
    end
    self.start.strftime "%H:%M"
  end
  
  def time=(val)
    hour, minute = val.split(":").map { |x| x.to_i }
    
    self.start = self.start.change(:hour=>hour, :min=>minute)
  end
  
  def duration
    if self.start == nil || self.end == nil
      return 0
    end
    
    return (self.end - self.start)
  end

  def duration=(val)
    if val.is_a?String
      val = val.to_f.seconds
    end
    self.end = val.since self.start
  end
end
