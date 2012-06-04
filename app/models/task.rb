class Task < ActiveRecord::Base
  attr_accessible :description, :title, :user_group_id, :user_id

  belongs_to :user
  has_one :shift
  has_one :ticket
end
