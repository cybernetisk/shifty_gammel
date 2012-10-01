class Template < ActiveRecord::Base
  attr_accessible :description, :interval, :start, :stop, :title
  
  has_many :template_shift, inverse_of: :template
  
  def apply(start)
    return self.template_shift.map  do |template|
         template.makeShift(start)
    end
  end
end
