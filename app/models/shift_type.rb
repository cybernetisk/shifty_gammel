class ShiftType < ActiveRecord::Base
  attr_accessible :description, :location, :title
  has_many :shifts, dependent: :destroy, inverse_of: :shift_type
  has_many :certifications, dependent: :destroy, inverse_of: :shift_type
end
