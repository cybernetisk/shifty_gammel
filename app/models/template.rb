class Template < ActiveRecord::Base
  attr_accessible :description, :interval, :start, :stop, :title
  
  has_many :template_shift, inverse_of: :template
  
  def apply(start)
    return self.template_shift.map  do |template|
         template.makeShift(start)
    end
  end

  def get_period_start(i)
    self.start + (i * self.interval).days
  end

  def make_period(i)
    start = self.get_period_start(i)
    self.apply(start).each do |shift| shift.save end
  end

  def check_period(i)
    a = self.get_period_start(i)
    b = a + self.interval.days - 1.seconds

    return Shift.where(:template_shift_id=>self.template_shift, :start=>a..b).exists?
  end
end
