class AddExpiresToTicket < ActiveRecord::Migration
  def change
    add_column :tickets, :expires, :date
  end
end
