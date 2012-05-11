class Task < ActiveRecord::Base
  attr_accessible :description, :title, :user_group_id, :user_id
end
