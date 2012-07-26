require 'bcrypt'

class User < ActiveRecord::Base
  attr_accessible :username, :password, :password_confirmation, :admin
  attr_accessor :password
  before_save :encrypt_password

  has_many :shifts
  has_many :tickets, inverse_of: :user
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
      self.tickets_sum
  end

  # TODO: Check that the user was actually added to the group
  def add_to_group(group)
    if self.user_groups.include? group or !(group.is_a? UserGroup)
      return false
    else
      self.user_groups << group
      return true
    end
  end

  # TODO: Check that the user was actually removed from the group
  def remove_from_group(group)
    if self.user_groups.include? group and group.is_a? UserGroup
      self.user_groups.delete group
      return true
    else
      return false
    end
  end
  
  def to_s
    self.username
  end

  def withdraw(total)
    if total > self.tickets_sum
      return false
    end

    m = self.tickets.sum(:value, :group=>'tickets.expires', :order=>'tickets.expires IS NULL, tickets.expires ASC')
           #k.tickets.sum(:value, :group=>'tickets.expires', :order=>'tickets.expires IS NULL, tickets.expires ASC')
    m.each do |t|
      Ticket.new do |n|
        n.value = -[total, t[1]].min
        n.expires = t[0]
        n.user = self
        n.save
      end
      
      total -= t[1]

      if total <= 0
        break
      end
    end
    
    return true
  end

  def tickets_used()
    # TODO: do this in db and properly
    self.used_tickets.sum(:value)
  end
  
  def tickets_sum()
    self.tickets.sum(:value, :conditions=>  ["expires >= ?",Date.today])
  end
end
