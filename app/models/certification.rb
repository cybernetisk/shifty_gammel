class Certification < ActiveRecord::Base
  belongs_to :shift_type
  belongs_to :user
end
