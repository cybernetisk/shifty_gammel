class TemplateShift < ActiveRecord::Base
  attr_accessible :comment, :shift_type_id, :start, :stop, :training, :template, :template_id
  
  
  belongs_to :shift_type
  belongs_to :template
  
  has_many :shift, inverse_of: :template
  
  # does the template exist within this period?
  def isApplied(i)
    return Shift.where(:template_shift_id=>self, :start=>template.get_period(i)).exists?
  end

  # returns an instance of the shift relative to the tempates start
  def makeShift(i)
    delta = self.template.get_period_offset(i)
    
    shift = Shift.new
    shift.start = self.start + delta
    shift.end   = self.stop + delta
    
    shift.shift_type = self.shift_type
    shift.comment = self.comment
    shift.template = self

    return shift
  end
  
end
