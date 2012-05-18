class Task < ActiveRecord::Base
  attr_accessible :description, :title, :user_group_id, :user_id

  has_one :user
  has_one :shift
  has_one :ticket
end
