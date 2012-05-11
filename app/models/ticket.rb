class Ticket < ActiveRecord::Base
  attr_accessible :shift_id, :used, :value

  belongs_to :shift
end
