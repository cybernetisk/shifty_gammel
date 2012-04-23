class User < ActiveRecord::Base
  attr_accessible :last_login, :username
  has_many :shifts, dependent: :nullify, inverse_of: :user
  has_many :certifications, dependent: :destroy, inverse_of: :user
end
