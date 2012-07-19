class Ticket < ActiveRecord::Base
  attr_accessible :task_id, :used, :value, :comment

  #belongs_to :task
  belongs_to :user
  belongs_to :issued_by, :foreign_key=>'issued_by_id', :class_name=>'User'
  has_one :shift
  
  def self.getTicketHistoryForUser(user)
    tickets = Ticket.where(task_id: Task.select("id").where(user_id: user));
    tickets
  end
  
end
