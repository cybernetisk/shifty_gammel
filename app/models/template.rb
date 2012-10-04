class Template < ActiveRecord::Base
  attr_accessible :description, :interval, :start, :stop, :title
  
  has_many :template_shift, inverse_of: :template
  
  # returns shifts in a period.
  def apply(i)
    self.template_shift.map  do |template| template.makeShift(i) end
  end

  # returns shifts in a period that hasn't allready been applied.
  def careful_apply(i)
    res = self.template_shift.select do |template| !template.isApplied(i) end

    return res.map do |template| template.makeShift(i) end
  end

  # returns date of period start
  def get_period_start(i)
    self.start + (i * self.interval).days
  end

  def get_period_offset(i)
    (i * self.interval).days
  end

  def get_interval(date)
    ((date - start)/ interval.days).floor
  end

  def get_period(i)
    start = get_period_start(i)
    return start..(start + self.interval.days - 1.seconds)
  end

  # check if any shifts form this template already exists in the period.
  def check_period(i)
    Shift.where(:template_shift_id=>self.template_shift, :start=>self.get_period(i)).exists?
  end

  # Saves all template shifts into period.
  def make_period(i)
    self.apply(i).each do |shift| shift.save end
  end

  # Saves shifts in a period if template shift isn't already applied.
  def careful_make_period(i)
    self.careful_apply(i).each do |shift| shift.save end
  end

  # Count number of intervals in template period
  def count_intervals
    ((self.stop - self.start) / self.interval.days).floor
  end

  # Return an array of ranges, one for each period interval
  def periods
    self.count_intervals.times.map do |i| get_period(i) end
  end
end
