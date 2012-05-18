class Ticket < ActiveRecord::Base
  attr_accessible :task_id, :used, :value

  belongs_to :task
  
end
