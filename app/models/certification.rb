class Certification < ActiveRecord::Base
  attr_accessible :shift_type, :user_group, :manager
  belongs_to :shift_type
  belongs_to :user_group
end
