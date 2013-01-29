class TemplateShift < ActiveRecord::Base
  attr_accessible :comment, :shift_type_id, :start, :stop, :training, :template, :template_id
  
  
  belongs_to :shift_type
  belongs_to :template
  
  has_many :shift, inverse_of: :template

  before_save :set_default


   def set_default
     if self.stop == nil
        self.stop = self.start + 2.hours
      end
   end

  # does the template exist within this period?
  def isApplied(i)
    return Shift.where(:template_shift_id=>self, :start=>template.get_period(i)).exists?
  end

  # returns an instance of the shift relative to the tempates start
  def makeShift(i)
    delta = self.template.get_period_start(i)
    
    shift = Shift.new

    shift.start = delta + (start - template.template_start)
    shift.end   = delta + (stop - template.template_start)

    shift.shift_type = shift_type
    shift.comment = comment
    shift.template = self

    return shift
  end

  def updateShifts(i, from=nil, populated=false)
    sel = self.shift
    
    if from != nil
      sel = sel.where("start>?", from)
    end

    Shift.update_all(["start=?, end=?", self.start, self.end], :id=>sel)
  end

  def end
    self.stop
  end

  def end=(value)
    self.stop = value
  end
  
end
