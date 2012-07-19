class AddUserIdAndCommentToTicket < ActiveRecord::Migration
  def change
    add_column :tickets, :user_id, :integer
    add_column :tickets, :comment, :text
  end
end
