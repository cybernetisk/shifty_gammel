class Shift < ActiveRecord::Base
  attr_accessible :comment, :end, :leasing, :training, :start, :date, :duration, :time, :shift_type_id
  #belongs_to :task
  belongs_to :shift_type
  belongs_to :ticket
  belongs_to :user
  belongs_to :signed_by, :foreign_key=>'signed_by_id', :class_name=>'User'
  #has_one :user, through: :task
  belongs_to :same_as, :foreign_key=>'same_as_id', :class_name=>'Shift'
  belongs_to :template, :foreign_key=>'template_shift_id', :class_name=>'TemplateShift'
  
  before_save :add_ticket
  
  def add_ticket
    if self.ticket == nil
      ticket = Ticket.new
      ticket.value = self.shift_type.ticket_value
      ticket.save
      self.ticket = ticket
    end
  end
  
  attr_reader :signed_by
  def signed_by=(user)
    # TODO: check if user can sign shift?
    @signed_by = user
    if self.ticket != nil
      self.ticket.user = self.user # give ticket to user
    end
  end


  def self.getAvailableShifts
      shifts = Shift.where('user_id IS NULL AND start > ?', Time.now).order('shifts.start')
  #has_one :user, through: :task
  end


  def self.findForDate(date)
      date = date+"%";
      shifts = Shift.where("user_id IS NULL AND shifts.start LIKE ?", date)
  end
  
  def self.getUpcomingShifts
      shifts = Shift.where('user_id IS NULL AND start > ?', Time.now).order('shifts.start').limit(10)
      shifts
  end
  
  def self.getAllUpcomingShifts
      shifts = Shift.select("*").where('start > ?', Time.now).order('shifts.start')
      shifts
  end
  
  def self.getDatesWithAvailableShifts
    shifts = Shift.select("shifts.start").where('shifts.user_id'=> nil)
  end
  
  def self.getDatesWithNoAvailableShifts
    shifts = Shift.select("shifts.start").where('shifts.user_id IS NOT NULL')
    #remember to check that no shifts on this date is available
    shifts
  end

  def start=(val)
    duration = self.duration
    super(val)
    self.duration = duration.seconds
  end
  
  def date
    if self.start == nil
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
    self.start.hour
  end

  def minutes
    self.start.minutes
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
