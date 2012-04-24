class Certification < ActiveRecord::Base
  attr_accessible :shift_type, :user_group
  belongs_to :shift_type
  belongs_to :user_group
end
