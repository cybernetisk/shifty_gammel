class TemplateShift < ActiveRecord::Base
  attr_accessible :comment, :shift_type_id, :start, :stop, :training, :template, :template_id
  
  
  belongs_to :shift_type
  belongs_to :template
  
  has_many :shift, inverse_of: :template
  
  
  def makeShift(start)
    delta = start - self.template.start
    
    shift = Shift.new
    shift.start = delta.seconds.since self.start
    shift.end =   delta.seconds.since self.stop
    shift.shift_type = self.shift_type
    shift.comment = self.comment
    shift.template = self

    return shift
  end
  
end
