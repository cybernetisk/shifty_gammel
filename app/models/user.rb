require 'bcrypt'

class User < ActiveRecord::Base
  attr_accessible :username, :password, :password_confirmation, :admin
  attr_accessor :password
  before_save :encrypt_password

  has_many :shifts, dependent: :nullify, inverse_of: :user
  has_many :tickets, through: :shifts, inverse_of: :user
  has_many :certifications, dependent: :destroy, inverse_of: :user
  has_and_belongs_to_many :user_groups

  validates_confirmation_of :password
  validates_presence_of :password, :on => :create
  validates_presence_of :username
  validates_uniqueness_of :username

  def self.authenticate(username, password)
    user = find_by_username(username)
    if user && user.password_hash == BCrypt::Engine.hash_secret(password, user.password_salt)
      user
    else
      nil
    end
  end
  
  def encrypt_password
    if password.present?
      self.password_salt = BCrypt::Engine.generate_salt
      self.password_hash = BCrypt::Engine.hash_secret(password, password_salt)
    end
  end

  def can_take_shift?(shift)
    Certification.exists?(shift_type_id: shift.shift_type, user_group_id: user_groups)
  end

  def countUnusedTickets
      tasks = Task.where(user_id: self); # husk å legg til at skíftet også skal være signert
      tickets = 0;
      tasks.each do |task|
        if task.ticket != nil
          tickets += task.ticket.value
        end
      end
      tickets
  end  
end
