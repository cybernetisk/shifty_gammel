class Template < ActiveRecord::Base
  attr_accessible :description, :interval, :start, :stop, :title
  
  has_many :template_shift, inverse_of: :template
  
  # returns shifts in a period.
  def apply(i)
    a = self.get_period_start(i)
    return self.template_shift.map  do |template|
         template.makeShift(a)
    end
  end

  # returns shifts in a period that hasn't allready been applied.
  def careful_apply(i)
    a = self.get_period_start(i)
    # substract 1 second to allow close overlap between weeks
    b = a + self.interval.days - 1.seconds
    in_place = Shift.where(:template_shift_id=>self.template_shift, :start=>a..b).all.map do |x| x.template_shift_id end
    
    res = self.template_shift

    if in_place.length > 0 
      res = res.where("template_shifts.id not in (?)", in_place)
    end  
    
    return res.map do |template|
        template.makeShift(start)
      end
  end

  # returns date of period start
  def get_period_start(i)
    self.start + (i * self.interval).days
  end

  # check if any shifts form this template already exists in the period.
  def check_period(i)
    a = self.get_period_start(i)
    # substract 1 second to allow close overlap between weeks
    b = a + self.interval.days - 1.seconds

    return Shift.where(:template_shift_id=>self.template_shift, :start=>a..b).exists?
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
    return ((self.stop - self.start) / self.interval.days).floor
  end

  # Return an array of ranges, one for each period interval
  def periods
    return self.count_intervals.times.map do |i|
      get_period_start(i)..(get_period_start(i) + interval.days)
    end
  end
end
