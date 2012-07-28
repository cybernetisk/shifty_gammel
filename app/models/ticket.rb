class Ticket < ActiveRecord::Base
  attr_accessible :used, :value, :comment, :expires, :user

  #belongs_to :task
  belongs_to :user
  belongs_to :issued_by, :foreign_key=>'issued_by_id', :class_name=>'User'
  has_one :shift
  
  def self.getTicketHistoryForUser(user)
    tickets = Ticket.where(user_id: user);
    tickets
  end


  def user=(val)
    self[:user]=(val)
    if self.expires == nil
      self.expires = 6.months.since Date.today
    end
  end

  attr_reader :user
end
