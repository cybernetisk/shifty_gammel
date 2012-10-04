class TemplateShift < ActiveRecord::Base
  attr_accessible :comment, :shift_type_id, :start, :stop, :training, :template, :template_id
  
  
  belongs_to :shift_type
  belongs_to :template
  
  has_many :shift, inverse_of: :template
  
  
  # returns an instance of the shift relative to the tempates start
  def makeShift(start)
    delta = start - self.template.start
    
    shift = Shift.new
    shift.start = self.start + delta
    shift.end =   self.stop + delta
    
    shift.shift_type = self.shift_type
    shift.comment = self.comment
    shift.template = self

    return shift
  end
  
end
