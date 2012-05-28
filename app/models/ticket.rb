class Ticket < ActiveRecord::Base
  attr_accessible :task_id, :used, :value

  belongs_to :task
  
  def self.getTicketHistoryForUser(user)
    tickets = Ticket.where(task_id: Task.select("id").where(user_id: user));
    tickets
  end
  
end
